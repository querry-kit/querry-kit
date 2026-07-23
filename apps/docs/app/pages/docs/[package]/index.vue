<template>
  <DocsPage :package-id="packageId" :page="currentPage" />
</template>

<script setup lang="ts">
import type { DocsCollectionItem } from '@nuxt/content';
import type { PackageId } from '~/utils/docs';
import { getDocumentationPackage } from '~/utils/docs';

const route = useRoute();
const packageId = route.params.package as PackageId;
if (!getDocumentationPackage(packageId)) throw createError({ statusCode: 404, statusMessage: 'Package not found', fatal: true });

const { data: page } = await useAsyncData<DocsCollectionItem | null>(route.path, () =>
  queryCollection('docs').path(route.path).first(),
);
const currentPage = computed<DocsCollectionItem>(() => {
  if (!page.value) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true });
  }

  return page.value;
});

useSeoMeta({ title: currentPage.value.title, description: currentPage.value.description });
</script>
