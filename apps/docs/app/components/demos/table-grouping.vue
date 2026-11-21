<template>
  <DemosDemoShell
    title="Live grouping"
    description="Complete counts across 84 synthetic records; groups and records load independently."
  >
    <div class="space-y-3" data-testid="grouping-demo">
      <DefineLeaf v-slot="{ leaf }">
        <UTable :data="leaf.items" :columns="rowColumns" :caption="label(leaf.value)" :ui="{ caption: 'sr-only' }" />
        <QTablePagination
          v-if="table.loadingMode.value === 'pagination'"
          :page="table.getItemPage(leaf.path).page"
          :items-per-page="table.itemsPerPage.value"
          :total-items="table.getItemPage(leaf.path).totalItems"
          :page-sizes="[]"
          :loading="leaf.loading"
          :shortcuts="false"
          :texts="texts"
          @update:page="table.loadItemsPage(leaf.path, $event)"
        />
        <QTableGroupLoadMore
          v-else-if="!leaf.error"
          :has-more="leaf.hasMore"
          :loading="leaf.loading"
          :texts="texts"
          @load="table.loadMoreItems(leaf.path)"
        />
      </DefineLeaf>
      <QTableToolbar v-model:grouping="table.grouping.value" :groupable-fields="groupableFields">
        <template #new>
          <UButton variant="ghost" label="Refresh groups" @click="table.refresh()" />
        </template>
      </QTableToolbar>
      <p class="text-sm text-muted">Synthetic in-browser API fixture. No production data or live database.</p>
      <template v-for="node in table.groups.value" :key="node.key">
        <QTableGroup
          :label="label(node.value)"
          :count="node.count"
          :expanded="node.expanded"
          :loading="node.loading"
          :error="node.error"
          @toggle="table.toggleGroup(node.path)"
          @retry="retry(node)"
        >
          <template v-if="node.path.length < table.grouping.value.length">
            <QTableGroup
              v-for="child in node.children"
              :key="child.key"
              :label="label(child.value)"
              :count="child.count"
              :expanded="child.expanded"
              :loading="child.loading"
              :error="child.error"
              @toggle="table.toggleGroup(child.path)"
              @retry="table.loadMoreItems(child.path)"
            >
              <ReuseLeaf :leaf="child" />
            </QTableGroup>
            <QTableGroupLoadMore
              v-if="!node.error"
              :has-more="node.hasMore"
              :loading="node.loading"
              :texts="texts"
              @load="table.loadMoreGroups(node.path)"
            />
          </template>
          <ReuseLeaf v-else :leaf="node" />
        </QTableGroup>
      </template>
      <UTable v-if="!grouped" :data="table.root.items" :columns="rowColumns" caption="Demo tasks" :ui="{ caption: 'sr-only' }" />
      <p v-if="grouped && table.root.error" role="alert">Unable to load groups.</p>
      <QTableGroupLoadMore
        v-if="grouped || (table.loadingMode.value === 'pagination' && table.root.error)"
        :has-more="table.root.hasMore"
        :loading="table.root.loading"
        :error="table.root.error"
        :texts="texts"
        @load="loadRoot"
      />
      <QTablePagination
        v-model:loading-mode="table.loadingMode.value"
        v-model:items-per-page="table.itemsPerPage.value"
        :page="flatPage?.page ?? 1"
        :total-items="flatPage?.totalItems ?? 0"
        :grouped="grouped"
        :loaded-items="table.root.items.length"
        :has-more="table.root.hasMore"
        :loading="table.root.loading"
        :error="table.root.error"
        :texts="texts"
        @update:page="table.loadItemsPage([], $event)"
        @load-more="table.loadMoreItems([])"
      />
    </div>
  </DemosDemoShell>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import { useGroupedTable } from '@querry-kit/nuxt';
import type { GroupNode, GroupValue, GroupingField, TableColumnInput } from '@querry-kit/nuxt/types';
import { createReusableTemplate } from '@vueuse/core';
import { AxiosHeaders, create } from 'axios';
import type { AxiosResponse } from 'axios';

import { useDemoTableLoadingTexts } from '../../composables/use-demo-table-loading-texts';

interface Task extends Record<string, unknown> {
  id: string;
  title: string;
  status: string;
  category: string;
}
const texts = useDemoTableLoadingTexts();
const [DefineLeaf, ReuseLeaf] = createReusableTemplate<{ leaf: GroupNode<Task> }>();
const rowColumns: TableColumn<Task>[] = [{ accessorKey: 'title', header: 'Task' }];
const records: Task[] = Array.from({ length: 84 }, (_, index) => ({
  id: String(index).padStart(3, '0'),
  title: `Task ${index + 1}`,
  status: index < 42 ? 'Open' : 'Done',
  category: index % 2 ? 'Feature' : 'Bug',
}));
/**
 * Matches a synthetic task against the grouping demo's equality filters.
 * @param {Task} item Task to test.
 * @param {Record<string, unknown>} where Filter from the request.
 * @returns {boolean} Whether the task matches.
 */
const matches = (item: Task, where: Record<string, unknown>): boolean =>
  Object.entries(where).every(([field, value]) =>
    field === 'AND'
      ? (value as Record<string, unknown>[]).every((part) => matches(item, part))
      : Object.is(item[field], (value as { equals: unknown }).equals),
  );
const api = create({
  adapter: async (config): Promise<AxiosResponse> => {
    const query = new URL(config.url!, 'https://fixture.invalid').searchParams;
    const where = JSON.parse(query.get('where') ?? '{}') as Record<string, unknown>;
    const filtered = records.filter((item) => matches(item, where));
    let data: unknown;
    if (config.url!.includes('/group-by?')) {
      const field = query.get('by[0]')!;
      const values: string[] = [...new Set(filtered.map((item) => String(item[field])))].sort();
      const skip = Number(query.get('skip'));
      data = values
        .slice(skip, skip + Number(query.get('take')))
        .map((value) => ({
          [field]: value,
          _count: { _all: filtered.filter((item) => item[field] === value).length },
        }));
    } else {
      const size = Number(query.get('perPage'));
      const skip = (Number(query.get('page')) - 1) * size;
      data = {
        items: filtered.slice(skip, skip + size),
        meta: { itemCount: filtered.length, pageCount: Math.ceil(filtered.length / size) },
      };
    }
    return { data, status: 200, statusText: 'OK', headers: new AxiosHeaders(), config };
  },
});
const columns = ref<readonly TableColumnInput<Task>[]>([{ id: 'title' }, { id: 'status' }, { id: 'category' }]);
const groupableFields: GroupingField[] = [
  { value: 'status', label: 'Status' },
  { value: 'category', label: 'Category' },
];
const table = useGroupedTable<Task>({
  api,
  endpoint: 'tasks',
  persistenceKey: 'grouping-demo',
  storage: { getItem: () => null, setItem: () => undefined },
  columns,
  groupableFields,
  defaultGrouping: ['status', 'category'],
  groupBatchSize: 1,
  defaultItemsPerPage: 5,
  loading: { initialGroupItems: 5, groupLoadMoreItems: 3 },
});
const grouped = computed<boolean>(() => table.grouping.value.length > 0);
const flatPage = computed(() => grouped.value ? undefined : table.getItemPage());
/**
 * Formats a grouping value for the header and table caption.
 * @param {GroupValue} value Group key.
 * @returns {string} Display name.
 */
const label = (value: GroupValue): string => String(value ?? 'No value');
/**
 * Retries the request for an intermediate group or a leaf.
 * @param {GroupNode<Task>} node Group with a failed request.
 * @returns {Promise<void>} Completion of the retry.
 */
const retry = (node: GroupNode<Task>): Promise<void> =>
  node.path.length < table.grouping.value.length ? table.loadMoreGroups(node.path) : table.loadMoreItems(node.path);
/** @returns {Promise<void>} Completion of root group continuation or flat retry. */
const loadRoot = (): Promise<void> => (grouped.value ? table.loadMoreGroups() : table.loadMoreItems([]));
onMounted(() => {
  void table.initialize();
});
</script>
