<template>
  <UDashboardPanel
    id="workboard-main"
    :ui="{ root: 'min-h-0', body: fullPage ? 'min-h-0 min-w-0 gap-0 p-0 sm:gap-0 sm:p-0' : 'min-w-0' }"
  >
    <template #header>
      <UDashboardNavbar :title="title" :as="{ title: heading ? 'h1' : 'span' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <DemoAccountSwitcher v-if="session" :login="session.login" :pending="switching" @select="select" />
          <UColorModeButton />
        </template>
      </UDashboardNavbar>
      <WorkboardToolbarLayout v-if="breadcrumbs?.length" :breadcrumbs="breadcrumbs" />
      <slot name="toolbar" />
    </template>

    <template #body>
      <slot />
    </template>

    <template #footer>
      <slot name="footer" />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui';

withDefaults(defineProps<{ title: string; fullPage?: boolean; heading?: boolean; breadcrumbs?: BreadcrumbItem[] }>(), {
  heading: true,
});
const { session, switching, select } = useDemoSession();
</script>
