<template>
  <div v-if="fields.length" class="flex gap-2">
    <USelect
      v-model="selected"
      class="w-full"
      size="sm"
      value-key="value"
      :items="fields"
      :placeholder="t('sorting.field')"
      :aria-label="t('sorting.field')"
    />
    <UButton
      size="sm"
      :icon="icon('sorting.add')"
      :aria-label="t('sorting.add')"
      :disabled="!selected"
      @click="addSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTableI18n } from '../../../composables/use-table-i18n';
import { useTableIcons } from '../../../composables/use-table-icons';
import type { TableIconOverrides } from '../../../icons';
import type { TableTextOverrides } from '../../../texts';
import type { SortingField } from '../../../types/table';

const props = defineProps<{
  fields: SortingField[];
  texts?: TableTextOverrides;
  icons?: TableIconOverrides;
  add: (id: string) => void;
}>();
const t = useTableI18n(() => props.texts);
const icon = useTableIcons(props.icons);
const selected = ref<string>();
const addSelected = () => {
  if (selected.value) props.add(selected.value);
  selected.value = undefined;
};
</script>
