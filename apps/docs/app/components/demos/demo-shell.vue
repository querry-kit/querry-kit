<template>
  <section class="not-prose my-7 overflow-visible rounded-xl border border-default bg-elevated/40 p-4 sm:p-6">
    <div class="mb-5">
      <p class="font-medium text-highlighted">{{ title }}</p>
      <p class="mt-1 text-sm text-muted">{{ description }}</p>
    </div>
    <div class="rounded-lg border border-default bg-default p-3 sm:p-4">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ title: string; description: string }>();
</script>
