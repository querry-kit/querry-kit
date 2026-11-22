<template>
  <UDropdownMenu :items="actions">
    <UButton
      ref="trigger"
      color="neutral"
      variant="ghost"
      icon="i-tabler-dots-vertical"
      :aria-label="`Actions for ${project.title}`"
    />
  </UDropdownMenu>
  <ProjectEditor v-model:open="editing" :project="project" @saved="emit('changed')" @after:leave="restoreFocus" />
  <WorkboardDeleteDialog
    v-model:open="deleting"
    title="Delete project"
    :description="`Delete “${project.title}”? The project must have no tasks.`"
    :remove="removeProject"
    @deleted="emit('changed')"
    @after:leave="restoreFocus"
  />
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';
import type { ProjectLookup } from '@workboard/contracts';

const { project } = defineProps<{ project: ProjectLookup }>();
const emit = defineEmits<{ changed: [] }>();
const api = useWorkboardResources('projects');
const trigger = useTemplateRef('trigger');
const editing = ref(false);
const deleting = ref(false);
const actions: DropdownMenuItem[] = [
  { label: 'Edit', icon: 'i-tabler-pencil', onSelect: edit },
  { label: 'Delete', icon: 'i-tabler-trash', color: 'error', onSelect: confirmDeletion },
];

/** Opens the project editor from the row menu. */
function edit(): void {
  editing.value = true;
}

/** Opens the confirmation dialog before any data change. */
function confirmDeletion(): void {
  deleting.value = true;
}

/** Deletes the project only after confirmation. */
async function removeProject(): Promise<void> {
  await api.delete(project.id);
}

/** Returns keyboard focus to the persistent row action trigger after a dialog closes. */
function restoreFocus(): void {
  trigger.value?.$el?.focus();
}
</script>
