<template>
  <TasksTaskTable v-if="activeSession" :key="activeSession.id" :session="activeSession" />
</template>

<script setup lang="ts">
const { activeSession } = useDemoSession();
</script>
