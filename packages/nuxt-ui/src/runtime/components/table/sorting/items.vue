<template>
  <VueDraggable
    v-if="hasSorting"
    v-model="sorting"
    handle=".drag-handle"
    tag="ul"
    class="flex flex-col gap-2"
    :animation="150"
  >
    <template v-for="(sort, index) in sorting" :key="sort.id">
      <slot
        name="item"
        :sort="sort"
        :index="index"
        :remove="() => remove(sort.id)"
        :toggle-direction="() => toggleDirection(sort.id)"
        :show-drag-handle="sorting.length > 1"
      />
    </template>
  </VueDraggable>
</template>

<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus';
import type { SortingState } from '../../../types/table';

defineProps<{
  hasSorting: boolean;
  remove: (id: string) => void;
  toggleDirection: (id: string) => void;
}>();
const sorting = defineModel<SortingState>('sorting', { required: true });
</script>
