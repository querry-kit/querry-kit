<template>
  <DemosDemoShell
    title="Projects by status"
    description="Project counts and estimated hours use all matching records. Expand a status to see its preloaded rows."
  >
    <div data-testid="group-totals-demo" :data-api-requests="requests">
      <DemosProjectGroupsTable :api="api" />
    </div>
  </DemosDemoShell>
</template>

<script setup lang="ts">
import { AxiosHeaders, create } from 'axios';

const requests = ref<number>(0);
const projects = [
  ...Array.from({ length: 26 }, (_, index) => ({
    id: String(index + 1),
    title: `Open project ${index + 1}`,
    status: 'Open',
    estimatedHours: index + 1,
    archived: false,
  })),
  { id: '27', title: 'Blocked project', status: 'Blocked', estimatedHours: null, archived: false },
  { id: '28', title: 'Done project', status: 'Done', estimatedHours: 0, archived: false },
  { id: '29', title: 'Archived project', status: 'Open', estimatedHours: 1000, archived: true },
];

const api = create({
  adapter: async (config) => {
    requests.value += 1;
    const { pathname, searchParams } = new URL(config.url ?? '', 'https://fixture.invalid');
    const rows = projects.filter((project) => String(project.archived) === searchParams.get('where[archived]'));
    const perPage = Number(searchParams.get('perPage'));
    const offset = (Number(searchParams.get('page')) - 1) * perPage;
    const data = pathname.endsWith('/group-by')
      ? [...Map.groupBy(rows, (project) => project.status).entries()]
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([status, group]) => {
            const hours = group.map((project) => project.estimatedHours).filter((estimate) => estimate !== null);
            return {
              status,
              _count: { _all: group.length },
              _sum: { estimatedHours: hours.length ? hours.reduce((sum, estimate) => sum + estimate, 0) : null },
            };
          })
      : {
          items: rows.slice(offset, offset + perPage),
          meta: { itemCount: rows.length, pageCount: Math.ceil(rows.length / perPage) },
        };

    return { data, status: 200, statusText: 'OK', headers: new AxiosHeaders(), config };
  },
});
</script>
