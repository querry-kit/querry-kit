<template>
  <UTooltip :text="label" :kbds="['Shift', 'N']">
    <UButton
      data-qk-new
      class="cursor-pointer max-sm:p-1.5"
      icon="i-tabler-plus"
      aria-keyshortcuts="Shift+N"
      :aria-label="label"
      :label="label"
      :ui="{ label: 'hidden sm:inline' }"
    />
  </UTooltip>
</template>

<script setup lang="ts">
defineProps<{ label: string }>();
</script>
