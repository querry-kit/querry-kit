<template>
  <DemosDemoShell title="Live pagination" description="Switch the footer between numbered pages and automatic row loading.">
    <div data-testid="pagination-demo">
      <UTable :data="table.items.value" :columns="columns" caption="Demo tasks" :ui="{ caption: 'sr-only' }" />
      <QTablePagination
        v-model:page="table.page.value"
        v-model:items-per-page="table.itemsPerPage.value"
        v-model:loading-mode="table.loadingMode.value"
        :total-items="table.totalItems.value"
        :loaded-items="table.items.value.length"
        :has-more="table.hasMore.value"
        :loading="table.loading.value"
        :error="table.error.value"
        :texts="texts"
        @load-more="table.loadMore()"
      />
    </div>
  </DemosDemoShell>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import { useTable } from '@querry-kit/nuxt';
import { AxiosHeaders, create } from 'axios';
import type { AxiosResponse } from 'axios';

import { useDemoTableLoadingTexts } from '../../composables/use-demo-table-loading-texts';

type Task = { id: string; title: string };

const texts = useDemoTableLoadingTexts();
const rows: Task[] = Array.from({ length: 123 }, (_, i) => ({
  id: String(i + 1).padStart(3, '0'),
  title: `Task ${i + 1}`,
}));
const api = create({
  adapter: async (config): Promise<AxiosResponse> => {
    const params = new URL(config.url!, 'https://fixture.invalid').searchParams;
    const size = Number(params.get('perPage'));
    const start = (Number(params.get('page')) - 1) * size;
    const data = {
      items: rows.slice(start, start + size),
      meta: { itemCount: rows.length, pageCount: Math.ceil(rows.length / size) },
    };
    return { data, status: 200, statusText: 'OK', headers: new AxiosHeaders(), config };
  },
});
const columns: TableColumn<Task>[] = [{ accessorKey: 'id', header: 'ID' }, { accessorKey: 'title', header: 'Task' }];
const table = useTable<Task>({
  api,
  endpoint: 'tasks',
  persistenceKey: 'pagination-demo',
  storage: { getItem: () => null, setItem: () => undefined },
  columns: ref([{ id: 'title' }]),
  defaultItemsPerPage: 10,
});
onMounted(() => {
  void table.initialize();
});
</script>
