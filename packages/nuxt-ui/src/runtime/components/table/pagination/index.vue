<template>
  <footer
    class="qk-pagination border-default relative flex items-center justify-between gap-2 border-t px-3 py-2"
    :class="ui?.root"
  >
    <div class="flex min-w-0 flex-1 items-center gap-2" :class="ui?.left">
      <slot
        name="left"
        :page="page"
        :items-per-page="itemsPerPage"
        :total-items="totalItems"
        :start="rowStart"
        :end="rowEnd"
      >
        <slot name="start" />
        <div v-if="!grouped" ref="summarySpace" class="min-w-0 flex-1 overflow-hidden">
          <div
            ref="summaryContent"
            class="w-max whitespace-nowrap"
            :class="{ invisible: summaryWidth > availableWidth }"
          >
            <slot name="summary" :start="rowStart" :end="rowEnd" :total-items="totalItems">
              <span v-if="infinite" class="text-muted text-sm">
                {{ t('pagination.loaded', { count: formatNumber(loadedItems), total: formatNumber(totalItems) }) }}
              </span>
              <PaginationSummary
                v-else
                :total-items="totalItems"
                :start="rowStart"
                :end="rowEnd"
                :summary="summary"
                :texts="texts"
              />
            </slot>
          </div>
        </div>
      </slot>
    </div>
    <div class="flex shrink-0 items-center gap-1.5" :class="ui?.right">
      <slot name="page-size" :items-per-page="itemsPerPage" :set-items-per-page="setItemsPerPage">
        <PaginationPageSize
          v-if="pageSizes.length"
          :items-per-page="itemsPerPage"
          :items="pageSizeItems"
          :texts="texts"
          :set-items-per-page="setItemsPerPage"
        />
      </slot>
      <slot
        v-if="!infinite && !grouped"
        name="pagination"
        :page="page"
        :page-count="pageCount"
        :first="first"
        :previous="previous"
        :next="next"
        :last="last"
      >
        <PaginationControls
          :disabled="loading"
          :page="page"
          :items-per-page="itemsPerPage"
          :total-items="totalItems"
          :set-page="(value) => (page = value)"
        />
      </slot>
      <USelect
        v-if="loadingMode"
        v-model="loadingMode"
        v-model:open="modeOpen"
        :aria-label="t('pagination.mode')"
        :content="{ position: 'popper' }"
        :items="modeItems"
      />
      <template v-if="infinite && !grouped">
        <span v-if="error" class="sr-only" role="alert">{{ t('pagination.error') }}</span>
        <UButton
          v-if="hasMore || error"
          size="sm"
          variant="ghost"
          :label="t(error ? 'pagination.retry' : 'pagination.loadMore')"
          :loading="loading"
          :disabled="loading"
          @click="requestMore"
        />
        <span v-if="loading" class="sr-only" role="status">{{ t('pagination.loading') }}</span>
      </template>
      <slot name="right" :page="page" :page-count="pageCount" />
    </div>
    <span v-if="infinite && !grouped" ref="sentinel" class="absolute inset-x-0 bottom-0 h-px" aria-hidden="true" />
  </footer>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue';
import { useElementSize } from '@vueuse/core';
import { useTableI18n, useTableNumber } from '../../../composables/use-table-i18n';
import type { TableTextOverrides } from '../../../texts';
import { canHandleTableShortcut } from '../../../utils/keyboard';
import PaginationPageSize from './page-size.vue';
import PaginationControls from './pagination.vue';
import PaginationSummary from './summary.vue';

const props = withDefaults(
  defineProps<{
    totalItems?: number;
    pageSizes?: number[];
    summary?: string;
    texts?: TableTextOverrides;
    shortcuts?: boolean;
    /** Shows the mode switch and page size for a grouped table. Leaf controls are rendered separately. */
    grouped?: boolean;
    /** Loaded row count for the flat infinite-scroll summary. */
    loadedItems?: number;
    /** Whether the flat table has another batch of rows. */
    hasMore?: boolean;
    /** Whether a row request is pending. */
    loading?: boolean;
    /** A failed flat infinite-scroll request, enabling manual retry. */
    error?: unknown;
    ui?: { root?: string; left?: string; right?: string };
  }>(),
  { totalItems: 0, pageSizes: () => [1, 2, 10, 25, 50, 100], shortcuts: true, loadedItems: 0 },
);
const page = defineModel<number>('page', { required: true });
const itemsPerPage = defineModel<number>('itemsPerPage', { required: true });
const loadingMode = defineModel<'pagination' | 'infinite'>('loadingMode');
const modeOpen = ref(false);
const emit = defineEmits<{ 'load-more': [] }>();
const sentinel = useTemplateRef<HTMLElement>('sentinel');
const { width: availableWidth } = useElementSize(useTemplateRef<HTMLElement>('summarySpace'));
const { width: summaryWidth } = useElementSize(useTemplateRef<HTMLElement>('summaryContent'));
const t = useTableI18n(() => props.texts);
const modeItems = computed(() => [
  { value: 'pagination', label: t('pagination.paginated') },
  { value: 'infinite', label: t('pagination.infinite') },
]);
const infinite = computed(() => loadingMode.value === 'infinite');
const canAutoLoad = computed(
  () => infinite.value && !props.grouped && props.hasMore && !props.loading && !props.error && !modeOpen.value,
);
const pageCount = computed(() => Math.max(1, Math.ceil(props.totalItems / itemsPerPage.value)));
const rowStart = computed(() => {
  if (infinite.value) return props.loadedItems ? 1 : 0;
  return props.totalItems === 0 ? 0 : (page.value - 1) * itemsPerPage.value + 1;
});
const rowEnd = computed(() =>
  infinite.value ? props.loadedItems : Math.min(rowStart.value - 1 + itemsPerPage.value, props.totalItems),
);
const formatNumber = useTableNumber();
const pageSizeItems = computed(() => props.pageSizes.map((value) => ({ value, label: formatNumber(value) })));
/** Requests the first page in pagination mode. */
const first = () => (page.value = 1);
/** Requests the previous page, stopping at the first page. */
const previous = () => (page.value = Math.max(1, page.value - 1));
/** Requests the next page, stopping at the last page. */
const next = () => (page.value = Math.min(pageCount.value, page.value + 1));
/** Requests the last page in pagination mode. */
const last = () => (page.value = pageCount.value);
/**
 * Updates the page size and keeps numbered pagination within the new page range.
 * @param {number} value New page size.
 */
const setItemsPerPage = (value: number) => {
  itemsPerPage.value = value;
  if (!infinite.value && !props.grouped)
    page.value = Math.min(page.value, Math.max(1, Math.ceil(props.totalItems / value)));
};
/**
 * Handles global shortcuts for a footer that presents numbered pages.
 * @param {KeyboardEvent} event Candidate keyboard shortcut.
 */
const onKeydown = (event: KeyboardEvent) => {
  if (
    infinite.value ||
    props.grouped ||
    props.loading ||
    !canHandleTableShortcut(event) ||
    !props.shortcuts ||
    !event.shiftKey
  )
    return;
  if (event.ctrlKey && event.key === 'ArrowLeft') first();
  else if (event.ctrlKey && event.key === 'ArrowRight') last();
  else if (event.key === 'ArrowLeft') previous();
  else if (event.key === 'ArrowRight') next();
  else return;
  event.preventDefault();
};

/** Requests another batch or a retry from the application. */
const requestMore = () => {
  if (infinite.value && !props.grouped && !props.loading && (props.hasMore || props.error)) emit('load-more');
};

watch(
  [sentinel, canAutoLoad, () => props.loadedItems],
  ([element, enabled], _, onCleanup) => {
    if (!element || !enabled || typeof IntersectionObserver === 'undefined') return;
    let active = true;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!active || !canAutoLoad.value || !entries.some((entry) => entry.isIntersecting)) return;
        active = false;
        observer.disconnect();
        requestMore();
      },
      { rootMargin: '0px 0px 160px 0px' },
    );
    observer.observe(element);
    onCleanup(() => {
      active = false;
      observer.disconnect();
    });
  },
  { flush: 'post' },
);

onMounted(() => document.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown));
</script>

<style>
.qk-pagination {
  container-type: inline-size;
}

@container (max-width: 28rem) {
  .qk-pagination
    [data-slot='list']
    :is([data-slot='first'], [data-slot='last'], [data-slot='ellipsis'], [data-slot='item']:not([data-selected])) {
    display: none;
  }
}
</style>
