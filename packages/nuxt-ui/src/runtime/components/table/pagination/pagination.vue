<template>
  <UPagination
    size="sm"
    :page="page"
    :items-per-page="itemsPerPage"
    :total="totalItems"
    :disabled="disabled"
    @update:page="setPage"
  />
</template>

<script setup lang="ts">
defineProps<{
  page: number;
  itemsPerPage: number;
  totalItems: number;
  disabled?: boolean;
  setPage: (value: number) => void;
}>();
</script>
