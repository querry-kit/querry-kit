<template>
  <WorkboardPanel
    title="Task details"
    :heading="false"
    :breadcrumbs="[{ label: 'Tasks', to: tasksLink }, { label: task?.title ?? 'Task details' }]"
  >
    <section class="mx-auto w-full max-w-4xl space-y-4" aria-labelledby="task-heading">
      <p v-if="loading" role="status" class="text-muted">
        Loading task…
      </p>
      <UAlert
        v-else-if="error"
        color="error"
        variant="soft"
        :title="error"
        :actions="[{ label: 'Retry', onClick: load }]"
      />
      <UCard v-else-if="task">
        <template #header>
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 id="task-heading" class="text-xl font-semibold">
                {{ task.title }}
              </h1>
              <p class="text-sm text-muted">
                {{ task.id }}
              </p>
            </div>
            <div v-if="task.id" class="flex flex-wrap gap-2">
              <TasksTaskEditor :task="task" @saved="applyUpdate">
                <UButton color="neutral" variant="outline" icon="i-tabler-pencil" label="Edit task" />
              </TasksTaskEditor>
              <WorkboardDeleteDialog
                title="Delete task"
                :description="`Delete “${task.title}”? This action is permanent.`"
                :remove="removeTask"
                @deleted="returnToTasks"
              >
                <UButton color="error" variant="outline" icon="i-tabler-trash" label="Delete task" />
              </WorkboardDeleteDialog>
            </div>
          </div>
        </template>
        <dl class="grid gap-4 sm:grid-cols-2">
          <div>
            <dt class="text-xs uppercase text-muted">
              Project
            </dt>
            <dd>
              {{ task.project?.title ?? '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-xs uppercase text-muted">
              Owner
            </dt>
            <dd>
              {{ task.owner?.profile?.displayName ?? '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-xs uppercase text-muted">
              Assignee
            </dt>
            <dd>
              {{ task.assignee?.profile?.displayName ?? 'Unassigned' }}
            </dd>
          </div>
          <div>
            <dt class="text-xs uppercase text-muted">
              Status / priority
            </dt>
            <dd>
              {{ task.status }} / {{ task.priority }}
            </dd>
          </div>
          <div>
            <dt class="text-xs uppercase text-muted">
              Estimated hours
            </dt>
            <dd>
              {{ task.estimatedHours }}
            </dd>
          </div>
          <div>
            <dt class="text-xs uppercase text-muted">
              Labels
            </dt>
            <dd class="flex flex-wrap gap-1">
              <UBadge
                v-for="label in task.labels"
                :key="label.id"
                color="neutral"
                variant="subtle"
                :label="label.displayName"
              />
            </dd>
          </div>
          <div v-if="task.internalNote !== undefined">
            <dt class="text-xs uppercase text-muted">
              Internal note
            </dt>
            <dd>
              {{ task.internalNote }}
            </dd>
          </div>
          <div v-if="task.internalCostCents !== undefined">
            <dt class="text-xs uppercase text-muted">
              Internal cost (¢)
            </dt>
            <dd>
              {{ task.internalCostCents }}
            </dd>
          </div>
        </dl>
      </UCard>
    </section>
  </WorkboardPanel>
</template>

<script setup lang="ts">
import { resourceIdSchema, taskSchema, type Task } from '@workboard/contracts';

const route = useRoute();
const router = useRouter();
const { activeSession } = useDemoSession();
const task = shallowRef<Task>();
const error = ref<string>();
const loading = ref(false);
let request = 0;

const api = useWorkboardResources('tasks');
const tasksLink = computed(
  /** Keeps the project context when returning from a task. */
  () => ({ path: '/tasks', query: { project: route.query.project, projectOp: route.query.projectOp } }),
);

/** Updates the detail from the validated write response. */
function applyUpdate(updated: Task): void {
  task.value = updated;
}

/** Deletes the currently displayed task. */
async function removeTask(): Promise<void> {
  if (task.value?.id) await api.delete(task.value.id);
}

/** Returns to the task list after the delete completes. */
function returnToTasks(): void {
  void router.replace(tasksLink.value);
}

/** Uses the typed detail client and ignores responses for an older route or session. */
async function load(): Promise<void> {
  const current = ++request;
  error.value = undefined;
  task.value = undefined;
  loading.value = false;
  if (!activeSession.value) return;

  const id = resourceIdSchema.safeParse(route.params.id);
  if (!id.success) {
    error.value = 'Invalid task ID.';
    return;
  }
  loading.value = true;
  try {
    const response = await api.findById(id.data);
    if (current === request) task.value = taskSchema.parse(response.data);
  } catch {
    if (current === request) error.value = 'Task is unavailable.';
  } finally {
    if (current === request) loading.value = false;
  }
}

watch([activeSession, /** Tracks navigation within the same page component. */ () => route.params.id], load);
onMounted(load);
onScopeDispose(
  /** Invalidates in-flight responses when the detail page unmounts. */ () => {
    request++;
  },
);
</script>
