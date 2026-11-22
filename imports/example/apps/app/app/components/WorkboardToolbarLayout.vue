<template>
  <UDashboardToolbar :ui="{ left: 'min-w-0', right: 'shrink-0' }">
    <template #left>
      <UBreadcrumb
        aria-label="Breadcrumb"
        class="min-w-0 max-w-full overflow-x-auto"
        :items="[{ label: 'Home', icon: 'i-tabler-home', to: '/' }, ...breadcrumbs]"
      />
    </template>
    <template v-if="actions" #right>
      <component :is="actions" />
    </template>
  </UDashboardToolbar>
  <UDashboardToolbar v-if="search || options" class="qk-table-toolbar" :ui="{ left: 'min-w-0', right: 'shrink-0' }">
    <template #left>
      <component :is="search" v-if="search" />
    </template>
    <template #right>
      <component :is="options" v-if="options" />
    </template>
  </UDashboardToolbar>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui';
import type { Component } from 'vue';

defineProps<{ breadcrumbs: BreadcrumbItem[]; actions?: Component; search?: Component; options?: Component }>();
</script>
