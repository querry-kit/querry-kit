<template>
  <DemosDemoShell
    title="Live grouping"
    description="Complete counts across 84 synthetic records; groups and records load independently."
  >
    <div class="space-y-3" data-testid="grouping-demo">
      <div class="flex items-center justify-between gap-2">
        <QTableGrouping v-model:grouping="table.grouping.value" :fields="groupableFields" />
        <UButton variant="ghost" label="Refresh groups" @click="table.refresh()" />
      </div>
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
          <template v-if="node.children.length">
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
              <ul class="space-y-1 text-sm">
                <li v-for="item in child.items" :key="item.id">{{ item.title }}</li>
              </ul>
              <QTableGroupLoadMore
                :has-more="child.hasMore"
                :loading="child.loading"
                :error="child.error"
                @load="table.loadMoreItems(child.path)"
              />
            </QTableGroup>
          </template>
          <ul v-else class="space-y-1 text-sm">
            <li v-for="item in node.items" :key="item.id">{{ item.title }}</li>
          </ul>
          <QTableGroupLoadMore
            :has-more="node.hasMore"
            :loading="node.loading"
            :error="node.error"
            @load="retry(node)"
          />
        </QTableGroup>
      </template>
      <ul v-if="!table.grouping.value.length" class="space-y-1 text-sm">
        <li v-for="item in table.root.items" :key="item.id">{{ item.title }}</li>
      </ul>
      <p v-if="table.root.error" role="alert">Unable to load groups.</p>
      <QTableGroupLoadMore
        :has-more="table.root.hasMore"
        :loading="table.root.loading"
        :error="table.root.error"
        @load="loadRoot"
      />
    </div>
  </DemosDemoShell>
</template>

<script setup lang="ts">
import { useGroupedTable } from '@querry-kit/nuxt';
import type { GroupNode, GroupValue, GroupingField, TableColumnInput } from '@querry-kit/nuxt/types';
import { AxiosHeaders, create } from 'axios';
import type { AxiosResponse } from 'axios';

interface Task extends Record<string, unknown> {
  id: string;
  title: string;
  status: string;
  category: string;
}
const records: Task[] = Array.from({ length: 84 }, (_, index) => ({
  id: String(index).padStart(3, '0'),
  title: `Task ${index + 1}`,
  status: index < 42 ? 'Open' : 'Done',
  category: index % 2 ? 'Feature' : 'Bug',
}));
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
});
const label = (value: GroupValue): string => String(value ?? 'No value');
const retry = (node: GroupNode<Task>): Promise<void> =>
  node.path.length < table.grouping.value.length ? table.loadMoreGroups(node.path) : table.loadMoreItems(node.path);
const loadRoot = (): Promise<void> => (table.grouping.value.length ? table.loadMoreGroups() : table.loadMoreItems([]));
onMounted(() => {
  void table.initialize();
});
</script>
