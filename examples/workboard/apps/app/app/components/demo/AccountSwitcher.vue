<template>
  <USelect
    aria-label="Switch demo account"
    :model-value="login"
    :items="accounts"
    :disabled="pending"
    :loading="pending"
    @update:model-value="choose"
  />
</template>

<script setup lang="ts">
import { demoLoginSchema, type DemoSession } from '@workboard/contracts';

defineProps<{ login: DemoSession['login']; pending: boolean }>();
const emit = defineEmits<{ select: [login: DemoSession['login']] }>();
const accounts = [...demoLoginSchema.options];

/** Ignores values outside the shared login contract. */
function choose(input: unknown): void {
  const candidate = demoLoginSchema.safeParse(input);
  if (candidate.success) emit('select', candidate.data);
}
</script>
