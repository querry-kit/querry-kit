<template>
  <UApp>
    <NuxtLoadingIndicator color="var(--ui-primary)" :height="2" />
    <AppHeader />
    <NuxtPage />
    <AppFooter />
    <UContentSearch :files="files ?? []" :navigation="navigation ?? []" />
  </UApp>
</template>

<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content';

type DocsSearchSections = Awaited<ReturnType<typeof queryCollectionSearchSections>>;

const { data: navigation } = await useAsyncData<ContentNavigationItem[]>('content-navigation', () =>
  queryCollectionNavigation('docs'),
);
const { data: files } = await useAsyncData<DocsSearchSections>('content-search', () => queryCollectionSearchSections('docs'));
</script>
