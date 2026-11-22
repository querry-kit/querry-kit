<template>
  <div ref="controls" class="sticky left-0 w-[100cqw]">
    <slot name="controls" :node="node" :leaf="leaf" :load="load">
      <slot v-if="node.error" name="error" :node="node" :error="node.error" :retry="load">
        <div role="alert" class="text-error flex items-center gap-2 px-4 py-2 text-sm">
          <span>{{ t('grouping.error') }}</span>
          <UButton size="xs" variant="ghost" :label="t('grouping.retry')" @click="load" />
        </div>
      </slot>
      <template v-if="!node.error || (leaf && node.items.length)">
        <slot />
        <GroupedPagination v-if="leaf" :texts="texts" :table="table" :path="node.path" :branch="node">
          <template v-if="$slots.pagination" #pagination="pagination">
            <slot name="pagination" v-bind="pagination" />
          </template>
        </GroupedPagination>
        <QTableGroupLoadMore v-else :texts="texts" :has-more="node.hasMore" :loading="node.loading" @load="load" />
      </template>
    </slot>
  </div>
</template>

<script setup lang="ts" generic="TItem extends Record<string, unknown>">
import { useIntersectionObserver } from '@vueuse/core';
import { ref, useTemplateRef, watch } from 'vue';
import GroupedPagination from './pagination.vue';
import { useTableI18n } from '../../../composables/use-table-i18n';
import type { TableTextOverrides } from '../../../texts';
import QTableGroupLoadMore from '../group/load-more.vue';

import type { GroupedTableNode, GroupedTableState } from '../../../types/grouped-table';

const { table, node, viewport, leaf, texts } = defineProps<{
  table: GroupedTableState<TItem>;
  node: GroupedTableNode<TItem>;
  viewport: HTMLElement | null;
  leaf: boolean;
  texts?: TableTextOverrides;
}>();
const t = useTableI18n(() => texts);
const controls = useTemplateRef('controls');
const visible = ref(false);
useIntersectionObserver(
  controls,
  /** Loads further leaf records only once their footer approaches the shared viewport. */
  ([entry]) => (visible.value = Boolean(entry?.isIntersecting)),
  {
    /** Observes the table viewport once it is mounted. */
    root: () => viewport,
    rootMargin: '48px 0px',
  },
);

/** Retries the branch or fetches its next batch. */
async function load(): Promise<void> {
  if (!leaf) await table.loadMoreGroups(node.path);
  else if (table.loadingMode.value === 'infinite') await table.loadMoreItems(node.path);
  else {
    const { page, requestedPage } = table.getItemPage(node.path);
    await table.loadItemsPage(node.path, requestedPage ?? page);
  }
}

watch(
  /** A visible footer may remain in view after an append, so re-check once loading finishes. */
  () => visible.value && leaf && table.loadingMode.value === 'infinite' && node.hasMore && !node.loading && !node.error,
  /** Delegates stale-response and duplicate-request handling to the grouped table. */
  (ready) => {
    if (ready) void load();
  },
);
</script>
