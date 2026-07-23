<template>
  <DemosDemoShell title="Live pagination" description="Change the page size or navigate a 123-item result set.">
    <QTablePagination v-model:page="page" v-model:items-per-page="itemsPerPage" :total-items="123" />
  </DemosDemoShell>
</template>

<script setup lang="ts">
const page = ref<number>(2);
const itemsPerPage = ref<number>(25);
</script>
