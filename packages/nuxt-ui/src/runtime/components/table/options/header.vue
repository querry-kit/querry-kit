<template>
  <div class="mb-4 flex items-center justify-between gap-2">
    <span ref="heading" class="flex items-center gap-2" tabindex="-1">
      <UIcon :name="icon('options.header')" />
      {{ t('options.title') }}
    </span>
    <UTooltip v-if="canReset" :text="t('options.reset')">
      <UButton
        color="error"
        size="xs"
        variant="outline"
        :icon="icon('options.reset')"
        :aria-label="t('options.reset')"
        @click="reset"
      />
    </UTooltip>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { useTableI18n } from '../../../composables/use-table-i18n';
import { useTableIcons } from '../../../composables/use-table-icons';
import type { TableIconOverrides } from '../../../icons';
import type { TableTextOverrides } from '../../../texts';

const props = defineProps<{ canReset: boolean; texts?: TableTextOverrides; icons?: TableIconOverrides }>();
const emit = defineEmits<{ reset: [] }>();
const t = useTableI18n(() => props.texts);
const icon = useTableIcons(props.icons);
const heading = useTemplateRef('heading');

/** Keeps focus in the popover when the reset button disappears. */
function reset(): void {
  heading.value?.focus();
  emit('reset');
}
</script>
