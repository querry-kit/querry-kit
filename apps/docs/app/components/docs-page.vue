<template>
  <UContainer class="grid min-h-[calc(100vh-7rem)] gap-10 py-8 lg:grid-cols-[15rem_minmax(0,1fr)_13rem]">
    <div class="flex items-center gap-2 lg:hidden">
      <UButton
        label="Navigation"
        color="neutral"
        variant="outline"
        icon="i-lucide-menu"
        @click="navigationOpen = true"
      />
      <UButton label="On this page" color="neutral" variant="ghost" icon="i-lucide-list" @click="tocOpen = true" />
    </div>

    <UDrawer v-model:open="navigationOpen" direction="left">
      <template #content>
        <div class="h-full overflow-y-auto p-6">
          <p class="mb-6 font-semibold text-highlighted">{{ packageItem.packageName }}</p>
          <UContentNavigation
            :navigation="navigationItems"
            :aria-label="`${packageItem.packageName} mobile navigation`"
            collapsible
            highlight
          />
        </div>
      </template>
    </UDrawer>

    <UDrawer v-model:open="tocOpen" direction="right">
      <template #content
        ><div class="h-full overflow-y-auto p-6">
          <UContentToc :links="page.body?.toc?.links ?? []" highlight highlight-variant="circuit" /></div
      ></template>
    </UDrawer>

    <aside class="hidden lg:block">
      <UContentNavigation
        :navigation="navigationItems"
        :aria-label="`${packageItem.packageName} navigation`"
        collapsible
        highlight
        class="sticky top-28"
      />
    </aside>

    <main class="min-w-0">
      <div class="mb-7 flex items-center justify-between gap-4">
        <UBadge color="neutral" variant="subtle">{{ packageItem.packageName }}</UBadge>
        <UButton
          :to="packageItem.repository"
          target="_blank"
          icon="i-lucide-github"
          color="neutral"
          variant="ghost"
          size="xs"
        >
          GitHub
        </UButton>
      </div>
      <article class="docs-prose prose prose-neutral dark:prose-invert max-w-none">
        <ContentRenderer :value="page" />
      </article>
      <UContentSurround v-if="surroundLinks" :surround="surroundLinks" class="mt-12 border-t border-default pt-6" />
    </main>

    <aside class="hidden xl:block">
      <div class="sticky top-28">
        <UContentToc :links="page.body?.toc?.links ?? []" class="z-2" highlight highlight-variant="circuit" />
      </div>
    </aside>
  </UContainer>
</template>

<script setup lang="ts">
import type { DocsCollectionItem } from '@nuxt/content';
import type { ContentNavigationLink } from '@nuxt/ui/runtime/components/content/ContentNavigation.vue';
import type { ContentSurroundLink } from '@nuxt/ui/runtime/components/content/ContentSurround.vue';
import type { DocumentationPackage, PackageId } from '~/utils/docs';
import { getDocumentationPackage, getSurroundingPages } from '~/utils/docs';

const props = defineProps<{ packageId: PackageId; page: DocsCollectionItem }>();
const route = useRoute();
const packageItem = computed<DocumentationPackage>(() => getDocumentationPackage(props.packageId)!);
const surround = computed<ReturnType<typeof getSurroundingPages>>(() => getSurroundingPages(packageItem.value, route.path));
const surroundLinks = computed<ContentSurroundLink[] | undefined>(() => {
  const { previous, next } = surround.value;

  if (!previous && !next) {
    return undefined;
  }

  return [
    previous && { title: previous.text, path: previous.path },
    next && { title: next.text, path: next.path },
  ] as unknown as ContentSurroundLink[];
});
const navigationItems = computed<ContentNavigationLink[]>(() =>
  packageItem.value.groups.map((group) => ({
    title: group.text,
    path: group.items[0]?.path ?? route.path,
    children: group.items.map((item) => ({
      title: item.text,
      path: item.path,
    })),
  })),
);
const navigationOpen = ref<boolean>(false);
const tocOpen = ref<boolean>(false);

watch(
  () => route.fullPath,
  () => {
    navigationOpen.value = false;
  },
);
</script>
