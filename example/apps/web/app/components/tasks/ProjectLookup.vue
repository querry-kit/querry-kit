<template>
  <UFormField label="Project" :name="name" :required="Boolean(name)">
    <USelectMenu
      v-model="project"
      v-model:search-term="search"
      size="sm"
      value-key="id"
      label-key="title"
      aria-label="Project"
      class="w-full"
      placeholder="Select a project"
      :items="items"
      :loading="loading"
      ignore-filter
    />
    <span v-if="error" role="status" class="mt-1 block text-sm text-error">Projects could not be loaded.</span>
  </UFormField>
</template>

<script setup lang="ts">
defineProps<{ name?: string }>();
const project = defineModel<string>();
const { search, items, loading, error } = useProjectLookup(project);
</script>
