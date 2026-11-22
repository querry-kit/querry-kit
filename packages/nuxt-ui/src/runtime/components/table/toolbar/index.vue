<template>
  <DefineBreadcrumb>
    <slot name="breadcrumb" :items="breadcrumbItems">
      <UBreadcrumb v-if="breadcrumbItems?.length" :items="breadcrumbItems" />
    </slot>
  </DefineBreadcrumb>

  <DefineSearch>
    <div v-if="$slots.search || search !== undefined" ref="searchRegion" class="contents">
      <slot name="search" :search="search" :set-search="setSearch">
        <UTooltip v-if="isSmall && !searchOpen" :text="searchLabel" :kbds="shortcuts ? ['Shift', '/'] : undefined">
          <UButton
            data-qk-search
            variant="ghost"
            :color="search ? 'primary' : 'neutral'"
            :icon="icon('search.input')"
            :aria-label="searchLabel"
            :aria-keyshortcuts="shortcuts ? 'Shift+/' : undefined"
            @click="openSearch"
          />
        </UTooltip>
        <UInput
          v-else-if="search !== undefined"
          class="qk-table-toolbar-search"
          :icon="icon('search.input')"
          :model-value="search"
          :placeholder="searchLabel"
          :aria-label="searchLabel"
          :aria-keyshortcuts="shortcuts ? 'Shift+/' : undefined"
          :ui="shortcuts && !isSmall ? { base: 'pe-16', trailing: 'pointer-events-none gap-0.5' } : undefined"
          @update:model-value="setSearch"
          @blur="searchOpen = false"
          @keydown.esc="closeSearch"
        >
          <template v-if="shortcuts && !isSmall" #trailing>
            <UKbd size="sm" value="Shift" aria-hidden="true" />
            <UKbd size="sm" value="/" aria-hidden="true" />
          </template>
        </UInput>
      </slot>
    </div>
  </DefineSearch>

  <DefineOptions>
    <slot name="options" :sorting="sorting" :filtering="filtering" :grouping="grouping" :column-order="columnOrder">
      <slot name="grouping" :grouping="grouping" :fields="groupableFields" :set-grouping="setGrouping">
        <QTableGrouping
          v-if="groupableFields?.length && grouping"
          v-model:grouping="grouping"
          :fields="groupableFields"
          :shortcuts="shortcuts"
          :texts="texts"
          :icons="icons"
        />
      </slot>
      <slot name="sorting" :sorting="sorting" :fields="sortableFields" :set-sorting="setSorting">
        <QTableSorting
          v-if="sortableFields?.length && sorting"
          v-model:sorting="sorting"
          :fields="sortableFields"
          :shortcuts="shortcuts"
          :texts="texts"
          :icons="icons"
        />
      </slot>
      <slot name="filtering" :filtering="filtering" :fields="filterFields" :set-filtering="setFiltering">
        <QTableFiltering
          v-if="filterFields?.length && filtering"
          v-model:filtering="filtering"
          :fields="filterFields"
          :context-active="filterContextActive"
          :shortcuts="shortcuts"
          :texts="texts"
          :icons="icons"
          @clear="emit('clear-filters')"
        >
          <template v-if="$slots['filter-context']" #context>
            <slot name="filter-context" />
          </template>
          <template v-if="$slots['filter-item']" #item="item">
            <slot name="filter-item" v-bind="item" />
          </template>
        </QTableFiltering>
      </slot>
      <slot
        name="column-options"
        :columns="columnDefinitions"
        :column-order="columnOrder"
        :invisible-columns="invisibleColumns"
        :column-pinning="columnPinning"
        :set-column-order="setColumnOrder"
        :set-invisible-columns="setInvisibleColumns"
        :set-column-pinning="setColumnPinning"
      >
        <QTableOptions
          v-if="columnDefinitions?.length && columnOrder && invisibleColumns && columnPinning"
          v-model:column-order="columnOrder"
          v-model:invisible-columns="invisibleColumns"
          v-model:column-pinning="columnPinning"
          :columns="columnDefinitions"
          :shortcuts="shortcuts"
          :texts="texts"
          :icons="icons"
        />
      </slot>
    </slot>
  </DefineOptions>

  <DefineActions>
    <div v-if="$slots.new" ref="newRegion" class="contents">
      <slot name="new" />
    </div>
  </DefineActions>

  <slot
    name="layout"
    :is-small="isSmall"
    :breadcrumb="Breadcrumb"
    :search="Search"
    :options="Options"
    :actions="Actions"
  >
    <div class="qk-table-toolbar" :class="ui?.root">
      <template v-if="isSmall">
        <UDashboardToolbar
          :class="ui?.primary"
          :ui="{ left: 'qk-table-toolbar-breadcrumb', right: 'qk-table-toolbar-actions' }"
        >
          <template #left>
            <Breadcrumb />
          </template>
          <template #right>
            <Actions />
          </template>
        </UDashboardToolbar>
        <UDashboardToolbar class="qk-table-toolbar-scrollbar-none" :class="ui?.secondary">
          <template #left>
            <Search />
          </template>
          <template #right>
            <Options />
          </template>
        </UDashboardToolbar>
      </template>

      <UDashboardToolbar v-else :class="[ui?.primary, ui?.secondary]">
        <template #left>
          <Breadcrumb />
        </template>
        <template #right>
          <Search />
          <Options />
          <Actions />
        </template>
      </UDashboardToolbar>
    </div>
  </slot>
  <UDashboardToolbar
    v-if="selectedCount > 0"
    class="qk-table-toolbar"
    role="toolbar"
    :aria-label="t('toolbar.selection')"
    :ui="{ root: 'flex-wrap gap-2', right: 'ms-auto flex-wrap justify-end' }"
  >
    <template #left>
      <span role="status" class="text-sm font-medium tabular-nums">
        {{ t('toolbar.selectedCount', { count: formatNumber(selectedCount) }) }}
      </span>
    </template>
    <template #right>
      <slot name="bulk-actions" :selected-count="selectedCount" />
    </template>
  </UDashboardToolbar>
</template>

<script setup lang="ts">
import { breakpointsTailwind, createReusableTemplate, useBreakpoints, useMounted } from '@vueuse/core';
import { computed, nextTick, provide, ref, useTemplateRef } from 'vue';
import { useTableShortcut } from '../../../composables/use-table-shortcut';
import { useTableI18n, useTableNumber } from '../../../composables/use-table-i18n';
import { useTableIcons } from '../../../composables/use-table-icons';
import type { TableIconOverrides } from '../../../icons';
import type { TableTextOverrides } from '../../../texts';
import type {
  ColumnDefinition,
  ColumnPinning,
  FilterField,
  Filtering,
  SortingField,
  SortingState,
  GroupingField,
} from '../../../types/table';

import { toolbarSmallKey } from './context';

const mounted = useMounted();
const smallBreakpoint = useBreakpoints(breakpointsTailwind).smaller('sm');
const isSmall = computed(() => mounted.value && smallBreakpoint.value);
provide(toolbarSmallKey, isSmall);
const [DefineBreadcrumb, Breadcrumb] = createReusableTemplate();
const [DefineSearch, Search] = createReusableTemplate();
const [DefineOptions, Options] = createReusableTemplate();
const [DefineActions, Actions] = createReusableTemplate();

const props = withDefaults(
  defineProps<{
    breadcrumbItems?: Array<Record<string, unknown>>;
    sortableFields?: SortingField[];
    groupableFields?: GroupingField[];
    filterFields?: FilterField[];
    /** Whether the application has an active filter in the filter-context slot. */
    filterContextActive?: boolean;
    columnDefinitions?: ColumnDefinition[];
    searchPlaceholder?: string;
    /** Total selected records across pages and groups. Zero hides the selection toolbar. */
    selectedCount?: number;
    /** Explicit text overrides. These take precedence over host-app i18n and English defaults. */
    texts?: TableTextOverrides;
    /** Explicit nested icon overrides forwarded to the default child controls. */
    icons?: TableIconOverrides;
    /** Enables keyboard shortcuts for the rendered toolbar controls. Defaults to true. */
    shortcuts?: boolean;
    ui?: { root?: string; primary?: string; secondary?: string };
  }>(),
  { shortcuts: true, selectedCount: 0 },
);
const searchRegion = useTemplateRef<HTMLElement>('searchRegion');
const searchOpen = ref(false);
const searchInput = () =>
  searchRegion.value?.querySelector<HTMLInputElement>('input:not([type="hidden"]):not(:disabled)');
const searchButton = () => searchRegion.value?.querySelector<HTMLButtonElement>('button[data-qk-search]');
function openSearch() {
  searchOpen.value = true;
  void nextTick(() => searchInput()?.focus());
}
function closeSearch(event: KeyboardEvent) {
  if (!isSmall.value) return;
  event.stopPropagation();
  searchOpen.value = false;
  void nextTick(() => searchButton()?.focus());
}
const newRegion = useTemplateRef<HTMLElement>('newRegion');
useTableShortcut(
  '/',
  () => props.shortcuts,
  () => {
    const input = searchInput();
    if (input) input.focus();
    else if (searchButton()) openSearch();
    else return false;
  },
);
useTableShortcut(
  'n',
  () => props.shortcuts,
  () => {
    const actions = newRegion.value?.querySelectorAll<HTMLElement>('button, a[href], [role="button"]');
    const trigger =
      newRegion.value?.querySelector<HTMLElement>('[data-qk-new]') ?? (actions?.length === 1 ? actions[0] : undefined);
    if (!trigger || trigger.matches(':disabled, [aria-disabled="true"]') || trigger.closest('[hidden], [inert]'))
      return false;
    trigger.click();
  },
);
const emit = defineEmits<{ 'clear-filters': [] }>();
const search = defineModel<string | undefined>('search');
const sorting = defineModel<SortingState>('sorting');
const grouping = defineModel<string[]>('grouping');
const filtering = defineModel<Filtering>('filtering');
const columnOrder = defineModel<string[]>('columnOrder');
const invisibleColumns = defineModel<string[]>('invisibleColumns');
const columnPinning = defineModel<ColumnPinning>('columnPinning');
const t = useTableI18n(() => props.texts);
const searchLabel = computed(() => props.searchPlaceholder ?? t('search.placeholder'));
const formatNumber = useTableNumber();
const icon = useTableIcons(props.icons);
const setSearch = (value: string | number | undefined) => (search.value = value == null ? undefined : String(value));
const setGrouping = (value: string[]) => (grouping.value = value);
const setSorting = (value: SortingState) => (sorting.value = value);
const setFiltering = (value: Filtering) => (filtering.value = value);
const setColumnOrder = (value: string[]) => (columnOrder.value = value);
const setInvisibleColumns = (value: string[]) => (invisibleColumns.value = value);
const setColumnPinning = (value: ColumnPinning) => (columnPinning.value = value);
</script>

<style>
.qk-table-toolbar :where(button, [role='button']):not(:disabled, [aria-disabled='true']) {
  cursor: pointer;
}

.qk-table-toolbar-breadcrumb {
  min-width: 0;
  overflow-x: auto;
  white-space: nowrap;
}

.qk-table-toolbar-actions {
  flex-shrink: 0 !important;
}

.qk-table-toolbar-scrollbar-none {
  scrollbar-width: none;
}

.qk-table-toolbar-scrollbar-none::-webkit-scrollbar {
  display: none;
}

.qk-table-toolbar-search {
  max-width: 8rem;
}

@media (min-width: 40rem) {
  .qk-table-toolbar-search {
    max-width: 10rem;
  }
}

@media (min-width: 48rem) {
  .qk-table-toolbar-search {
    max-width: none;
  }
}
</style>
