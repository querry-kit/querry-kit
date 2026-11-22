<template>
  <UModal v-model:open="open" :title="project ? 'Edit project' : 'New project'" :dismissible="!pending" :close="false">
    <template v-if="$slots.default" #default>
      <slot />
    </template>
    <template #body>
      <UForm class="space-y-4" :schema="projectCreateSchema" :state="state" @submit="save">
        <UFormField name="title" label="Title" required>
          <UInput v-model="state.title" class="w-full" :maxlength="160" />
        </UFormField>
        <UFormField name="slug" label="Slug" description="Lowercase letters, numbers, and hyphens." required>
          <UInput v-model="state.slug" class="w-full" :maxlength="80" />
        </UFormField>
        <UAlert v-if="error" color="error" variant="soft" role="alert" :title="error" />
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="outline" label="Cancel" :disabled="pending" @click="open = false" />
          <UButton type="submit" :label="project ? 'Save changes' : 'Create project'" :loading="pending" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import { projectCreateSchema, type ProjectCreate, type ProjectLookup } from '@workboard/contracts';

const props = defineProps<{ project?: ProjectLookup }>();
const emit = defineEmits<{ saved: [] }>();
const { create, update } = useWorkboardResources('projects');
const open = defineModel<boolean>('open', { default: false });
const pending = ref(false);
const error = ref('');
const state = reactive({ title: '', slug: '' });

watch(
  open,
  /** Starts each editing session from the current project data. */ (visible) => {
    if (!visible) return;
    state.title = props.project?.title ?? '';
    state.slug = props.project?.slug ?? '';
    error.value = '';
  },
);

/** Submits the validated form and leaves the draft intact on failure. */
async function save(event: FormSubmitEvent<ProjectCreate>): Promise<void> {
  if (pending.value) return;
  pending.value = true;
  error.value = '';
  try {
    if (props.project) await update(props.project.id, event.data);
    else await create(event.data);
    open.value = false;
    emit('saved');
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not save the project.';
  } finally {
    pending.value = false;
  }
}
</script>
