<template>
  <UApp>
    <AppHeader />
    <UError :error="error" />
    <AppFooter />
  </UApp>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app';

defineProps<{ error: NuxtError }>();
</script>
