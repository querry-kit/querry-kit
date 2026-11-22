<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({
  /** Keeps entry links and their project filter valid. */
  middleware: (to) => navigateTo({ path: '/tasks', query: to.query, hash: to.hash }, { redirectCode: 302 }),
});
</script>
