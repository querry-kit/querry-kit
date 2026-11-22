<template>
  <UBadge
    v-if="appearance"
    class="whitespace-nowrap"
    variant="subtle"
    :color="appearance.color"
    :icon="appearance.icon"
    :label="String(value)"
  />
  <template v-else-if="value != null">
    {{ field === 'internalCostCents' ? `${value} ¢` : value }}
  </template>
  <span v-else>—</span>
</template>

<script setup lang="ts">
import type { BadgeProps } from '@nuxt/ui';

const { field, value } = defineProps<{ field: string; value?: string | number | boolean | null }>();
const enums: Record<string, Record<string, Pick<BadgeProps, 'color' | 'icon'>>> = {
  status: {
    OPEN: { color: 'info', icon: 'i-tabler-circle' },
    IN_PROGRESS: { color: 'warning', icon: 'i-tabler-progress' },
    DONE: { color: 'success', icon: 'i-tabler-circle-check' },
    ARCHIVED: { color: 'neutral', icon: 'i-tabler-archive' },
  },
  priority: {
    LOW: { color: 'neutral', icon: 'i-tabler-arrow-down' },
    NORMAL: { color: 'info', icon: 'i-tabler-minus' },
    HIGH: { color: 'error', icon: 'i-tabler-arrow-up' },
  },
};
const appearance = computed(
  /** Uses both icon and color to distinguish enum values. */
  () => (typeof value === 'string' ? enums[field]?.[value] : undefined),
);
</script>
