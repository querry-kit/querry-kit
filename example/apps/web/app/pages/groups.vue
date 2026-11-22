<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({
  /** Keeps existing group bookmarks working after merging the views. */
  middleware: (to) => navigateTo({ path: '/tasks', query: to.query, hash: to.hash }, { redirectCode: 302 }),
});
</script>
