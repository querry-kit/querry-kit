<template>
  <div class="flex gap-2">
    <USelect
      v-model="selected"
      class="w-full"
      size="sm"
      value-key="value"
      :items="fields"
      :placeholder="t('filtering.field')"
      :aria-label="t('filtering.field')"
    />
    <UButton
      size="sm"
      :icon="icon('filtering.add')"
      :aria-label="t('filtering.add')"
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
import type { FilterField } from '../../../types/table';

const props = defineProps<{
  fields: FilterField[];
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
