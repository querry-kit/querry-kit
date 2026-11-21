<template>
  <UContainer as="main" class="py-8">
    <article v-if="page" class="docs-prose prose prose-neutral dark:prose-invert mx-auto max-w-3xl">
      <ContentRenderer :value="page" />
    </article>
  </UContainer>
</template>

<script setup lang="ts">
import type { ExampleCollectionItem } from '@nuxt/content';

const { data: page } = await useAsyncData<ExampleCollectionItem | null>('workboard-example', () =>
  queryCollection('example').path('/example').first(),
);

useSeoMeta({ title: () => page.value?.title, description: () => page.value?.description });
</script>
