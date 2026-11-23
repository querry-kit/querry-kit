<template>
  <UDashboardGroup unit="rem" storage-key="workboard-dashboard">
    <UDashboardSidebar
      id="workboard-sidebar"
      collapsible
      resizable
      :default-size="15"
      :min-size="13"
      :max-size="21"
      :ui="{ footer: 'border-t border-default' }"
    >
      <template #header="{ collapsed }">
        <NuxtLink to="/tasks" aria-label="Querry Kit Workboard" class="flex min-w-0 items-center gap-2 font-semibold">
          <UIcon name="i-tabler-layout-kanban" class="size-5 shrink-0 text-primary" />
          <span v-if="!collapsed">Querry Kit Workboard</span>
        </NuxtLink>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu aria-label="Workboard" orientation="vertical" :items="navigation" :collapsed="collapsed" />
      </template>

      <template #footer="{ collapsed }">
        <UNavigationMenu
          aria-label="Documentation"
          class="w-full"
          orientation="vertical"
          :items="documentation"
          :collapsed="collapsed"
        />
      </template>
    </UDashboardSidebar>

    <WorkboardPanel v-if="uncertain" title="Workboard" :heading="false">
      <UAlert
        role="alert"
        title="The write outcome is unknown."
        description="Refresh this account to check what was saved before trying again."
      />
      <UButton label="Refresh current account" :disabled="pendingWrites > 0" @click="refreshAccount" />
    </WorkboardPanel>
    <slot v-else-if="checked && activeSession" />
    <WorkboardPanel v-else title="Workboard" :heading="false">
      <p v-if="!checked || switching" role="status" class="text-muted">
        {{ checked ? 'Switching demo account…' : 'Starting demo session…' }}
      </p>
      <UAlert
        v-else-if="error"
        color="error"
        variant="soft"
        role="alert"
        title="Demo session unavailable"
        :description="error"
        :actions="[{ label: 'Retry', onClick: restore }]"
      />
    </WorkboardPanel>
  </UDashboardGroup>
</template>

<script setup lang="ts">
const { activeSession, checked, switching, pendingWrites, uncertain, error, restore } = useDemoSession();
/** Reloads the current route and verifies the existing account cookie before fetching resources. */
function refreshAccount(): void {
  window.location.reload();
}
const navigation = [
  { label: 'Projects', icon: 'i-tabler-folder', to: '/projects' },
  { label: 'Tasks', icon: 'i-tabler-list-details', to: '/tasks' },
];
const documentation = [
  {
    label: 'API reference',
    icon: 'i-tabler-api',
    to: '/docs',
    target: '_blank',
    rel: 'noopener noreferrer',
  },
  {
    label: 'Querry Kit docs',
    icon: 'i-tabler-book',
    to: 'https://querry-kit.github.io/querry-kit/',
    target: '_blank',
    rel: 'noopener noreferrer',
  },
];

onMounted(restore);
</script>
