<template>
  <UPageGrid class="not-prose my-5 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
    <UPageCard
      v-for="card in catalog[category]"
      :key="card.name"
      :title="card.name"
      :description="card.description"
      :to="`/docs/nuxt-ui/components/${card.target}`"
      class="min-w-0 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary"
      :ui="{ container: 'p-4 sm:p-5', title: 'break-words' }"
    >
      <template #header>
        <div aria-hidden="true" class="flex min-h-22 items-center justify-center rounded-md bg-elevated/60 p-3">
          <div class="grid max-w-full gap-1 rounded-md border border-default bg-default px-3 py-2 text-xs text-default shadow-xs">
            <span v-for="line in card.preview" :key="line" class="whitespace-pre-wrap">{{ line }}</span>
          </div>
        </div>
      </template>
    </UPageCard>
  </UPageGrid>
</template>

<script setup lang="ts">
type Category = 'controls' | 'filtering' | 'grouping';
type Card = { name: string; description: string; target: string; preview: string[] };
defineProps<{ category: Category }>();

const catalog: Record<Category, Card[]> = {
  controls: [
    { name: 'QTableToolbar', description: 'Bring search, create actions and table controls into one bar.', target: 'toolbar', preview: ['⌕  Search projects     + New'] },
    { name: 'QTableSorting', description: 'Choose sort fields and reorder them by priority.', target: 'sorting', preview: ['1   Due date   ↑', '2   Priority     ↓'] },
    { name: 'QTableOptions', description: 'Show, hide, reorder or pin columns.', target: 'options', preview: ['☑   Project name', '☐   Last updated'] },
    { name: 'QTablePagination', description: 'Navigate pages or switch to infinite scrolling.', target: 'pagination', preview: ['‹    1   [2]   3    ›'] },
  ],
  filtering: [
    { name: 'QTableFiltering', description: 'Build filter rules from fields, operators and values.', target: 'filtering', preview: ['Status    =    Active'] },
    { name: 'QTableFilterLookup', description: 'Search for a value to use in a select filter.', target: 'filtering#searchable-lookup-filters', preview: ['⌕   Fin…', '✓   Finance'] },
  ],
  grouping: [
    { name: 'QTableGrouping', description: 'Choose grouping fields and arrange their levels.', target: 'grouping#qtablegrouping', preview: ['1   Team', '2   Status'] },
    { name: 'QTableGrouped', description: 'Display nested groups and their records in a table.', target: 'grouping#qtablegrouped', preview: ['▾  Design', '   └  Active', '        Website'] },
    { name: 'QTableGroup', description: 'Expand or collapse one labeled group of records.', target: 'grouping#qtablegroup', preview: ['▾  Design    (12)'] },
    { name: 'QTableGroupLoadMore', description: 'Load the next batch of rows in an expanded group.', target: 'grouping#qtablegrouploadmore', preview: ['   └  Website', '      + Load more'] },
  ],
};
</script>
