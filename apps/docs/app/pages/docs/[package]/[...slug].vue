<template>
  <DocsPage v-if="currentPage" :package-id="packageId" :page="currentPage" />
  <UContainer v-else class="py-8">
    <USkeleton class="h-8 w-48" />
  </UContainer>
</template>

<script setup lang="ts">
import type { DocsCollectionItem } from '@nuxt/content';
import type { PackageId } from '~/utils/docs';
import { documentationRoutes, getDocumentationPackage } from '~/utils/docs';

const route = useRoute();
const packageId = route.params.package as PackageId;
if (!getDocumentationPackage(packageId)) throw createError({ statusCode: 404, statusMessage: 'Package not found', fatal: true });
const documentPath: string = route.path.replace(/\/+$/, '') || '/';
if (!documentationRoutes.includes(documentPath)) throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true });

const { data: page } = await useAsyncData<DocsCollectionItem | null>(route.path, () =>
  queryCollection('docs').path(documentPath).first(),
);
const currentPage = computed<DocsCollectionItem | undefined>(() => page.value ?? undefined);

useSeoMeta({ title: () => currentPage.value?.title, description: () => currentPage.value?.description });
</script>
