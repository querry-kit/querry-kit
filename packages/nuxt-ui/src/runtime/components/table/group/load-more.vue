<template>
  <slot v-if="hasMore || error" :has-more="hasMore" :loading="loading" :error="error" :load="load" :attrs="$attrs">
    <UButton
      size="sm"
      v-bind="$attrs"
      variant="ghost"
      :loading="loading"
      :disabled="loading"
      :label="t(error ? 'grouping.retry' : 'grouping.loadMore')"
      @click="load"
    />
  </slot>
</template>

<script setup lang="ts">
import { useTableI18n } from '../../../composables/use-table-i18n';
import type { TableTextOverrides } from '../../../texts';

defineOptions({ inheritAttrs: false });

/** Load-more/retry action for either child groups or leaf records. */
const props = defineProps<{ hasMore: boolean; loading?: boolean; error?: unknown; texts?: TableTextOverrides }>();
const emit = defineEmits<{ load: [] }>();
const load = () => emit('load');
const t = useTableI18n(() => props.texts);
</script>
