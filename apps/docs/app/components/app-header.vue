<template>
  <UHeader
    class="flex flex-col"
    :ui="{
      root: 'h-auto',
      left: 'min-w-0',
      right: 'gap-0.5'
    }"
  >
    <template #left>
      <ULink to="/" class="flex shrink-0 items-center gap-2 font-semibold text-highlighted">
        <img :src="logo" alt="Querry Kit" class="size-7" />
        <span>Querry Kit</span>
      </ULink>
      <UNavigationMenu
        as="nav"
        :items="primaryNavigationItems"
        variant="link"
        content-orientation="vertical"
        aria-label="Primary navigation"
        class="ml-3 hidden lg:flex"
      />
    </template>

    <template #right>
      <UContentSearchButton />
      <ThemePicker />
      <UButton
        to="https://github.com/querry-kit"
        target="_blank"
        icon="i-lucide-github"
        color="neutral"
        variant="ghost"
        square
        aria-label="GitHub"
      />
    </template>

    <template #body>
      <UNavigationMenu as="nav" :items="primaryNavigationItems" orientation="vertical" class="-mx-2.5" aria-label="Primary navigation" />
      <template v-if="isDocumentationRoute">
        <USeparator class="my-4" />
        <UNavigationMenu as="nav" :items="packageNavigationItems" orientation="vertical" highlight class="-mx-2.5" aria-label="Package documentation" />
      </template>
    </template>

    <template v-if="isDocumentationRoute" #bottom>
      <USeparator class="hidden lg:flex" />
      <UContainer class="hidden lg:flex items-center">
        <UNavigationMenu
          as="nav"
          :items="packageNavigationItems"
          variant="pill"
          highlight
          class="-mx-2.5 -mb-px"
          aria-label="Package documentation"
        />
      </UContainer>
    </template>
  </UHeader>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '#ui/types';
import { documentationPackages } from '~/utils/docs';
import logo from '~/assets/querry-kit-logo.svg';

const route = useRoute();
const isDocumentationRoute = computed<boolean>(() => route.path.startsWith('/docs/'));
const primaryNavigationItems: NavigationMenuItem[] = [{ label: 'Docs', to: '/docs/nest' }];
const packageNavigationItems = computed<NavigationMenuItem[]>(() => documentationPackages.map((item) => {
  const path = `/docs/${item.id}`;

  return {
    label: item.label,
    to: path,
    exact: true,
    active: route.path === path || route.path.startsWith(`${path}/`),
  };
}));
</script>
