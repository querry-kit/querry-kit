<template>
  <UModal v-model:open="open" :title="title" :description="description" :dismissible="!pending" :close="false">
    <template v-if="$slots.default" #default>
      <slot />
    </template>
    <template #body>
      <UAlert v-if="error" color="error" variant="soft" role="alert" :title="error" />
      <div class="flex justify-end gap-2" :class="{ 'mt-4': error }">
        <UButton color="neutral" variant="outline" label="Cancel" :disabled="pending" @click="open = false" />
        <UButton color="error" label="Delete" :loading="pending" @click="confirm" />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{ title: string; description: string; remove: () => Promise<unknown> }>();
const emit = defineEmits<{ deleted: [] }>();
const open = defineModel<boolean>('open', { default: false });
const pending = ref(false);
const error = ref('');

/** Deletes only after confirmation and leaves a failed request open for retry. */
async function confirm(): Promise<void> {
  if (pending.value) return;
  pending.value = true;
  error.value = '';
  try {
    await props.remove();
    open.value = false;
    emit('deleted');
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not delete the record.';
  } finally {
    pending.value = false;
  }
}

watch(open, /** Clears a previous failure when reopening the dialog. */ () => (error.value = ''));
</script>
