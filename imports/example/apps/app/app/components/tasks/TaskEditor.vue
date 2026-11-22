<template>
  <UModal
    v-model:open="open"
    :title="task ? 'Edit task' : 'New task'"
    :dismissible="!pending"
    :close="false"
    scrollable
  >
    <slot />
    <template #body>
      <UForm class="space-y-4" :schema="taskCreateSchema" :state="state" @submit="save">
        <UFormField name="title" label="Title" required>
          <UInput v-model="state.title" class="w-full" :maxlength="160" />
        </UFormField>
        <TasksProjectLookup v-model="state.projectId" name="projectId" />
        <div class="grid gap-4 sm:grid-cols-3">
          <UFormField name="status" label="Status" required>
            <USelect v-model="state.status" class="w-full" :items="statuses" />
          </UFormField>
          <UFormField name="priority" label="Priority" required>
            <USelect v-model="state.priority" class="w-full" :items="priorities" />
          </UFormField>
          <UFormField name="estimatedHours" label="Estimated hours" required>
            <UInput v-model.number="state.estimatedHours" class="w-full" type="number" min="0" step="1" />
          </UFormField>
        </div>
        <template v-if="canEditInternal">
          <UFormField v-if="!task" name="ownerLogin" label="Owner">
            <USelect v-model="state.ownerLogin" class="w-full" :items="owners" />
          </UFormField>
          <UFormField name="internalNote" label="Internal note">
            <UTextarea v-model="state.internalNote" class="w-full" :maxlength="2000" />
          </UFormField>
          <UFormField name="internalCostCents" label="Internal cost (¢)">
            <UInput v-model.number="state.internalCostCents" class="w-full" type="number" min="0" step="1" />
          </UFormField>
        </template>
        <UAlert v-if="error" color="error" variant="soft" role="alert" :title="error" />
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="outline" label="Cancel" :disabled="pending" @click="open = false" />
          <UButton type="submit" :label="task ? 'Save changes' : 'Create task'" :loading="pending" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import {
  demoLoginSchema,
  taskCreateSchema,
  taskPrioritySchema,
  taskStatusSchema,
  type Task,
  type TaskCreate,
} from '@workboard/contracts';

const props = defineProps<{ task?: Task; projectId?: string }>();
const emit = defineEmits<{ saved: [task: Task] }>();
const { create, update } = useWorkboardResources('tasks');
const { activeSession } = useDemoSession();
const canEditInternal = computed(
  /** Mirrors the admin-only write policy for the private fields. */
  () => activeSession.value?.role === 'admin',
);
const owners = demoLoginSchema.options;
const statuses = taskStatusSchema.options;
const priorities = taskPrioritySchema.options;
const open = ref(false);
const pending = ref(false);
const error = ref('');
const state = reactive<Partial<TaskCreate>>({});

/** Populates the form from the current task or the selected project. */
function reset(visible: boolean): void {
  if (!visible) return;
  const task = props.task;
  state.title = task?.title ?? '';
  state.projectId = task?.project?.id ?? props.projectId;
  state.status = task?.status ?? 'OPEN';
  state.priority = task?.priority ?? 'NORMAL';
  state.estimatedHours = task?.estimatedHours ?? 0;
  state.ownerLogin = canEditInternal.value && !task ? 'admin' : undefined;
  state.internalNote = canEditInternal.value ? (task?.internalNote ?? '') : undefined;
  state.internalCostCents = canEditInternal.value ? (task?.internalCostCents ?? 0) : undefined;
  error.value = '';
}

watch(open, reset);

/** Saves the validated form and keeps the dialog open on failure. */
async function save(event: FormSubmitEvent<TaskCreate>): Promise<void> {
  if (pending.value) return;
  pending.value = true;
  error.value = '';
  try {
    const id = props.task?.id;
    const response = id ? await update(id, event.data) : await create(event.data);
    open.value = false;
    emit('saved', response.data);
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not save the task.';
  } finally {
    pending.value = false;
  }
}
</script>
