<template>
  <UButton
    size="sm"
    color="neutral"
    variant="outline"
    :icon="icon"
    :label="label"
    :aria-pressed="selected"
    class="justify-start rounded-sm text-[11px] capitalize ring-default"
    :class="selected ? 'bg-elevated' : 'hover:bg-elevated/50'"
  >
    <template v-if="chip || slots.leading" #leading>
      <slot name="leading">
        <span
          data-slot="color-chip"
          class="inline-block size-2 rounded-full bg-(--color-light) dark:bg-(--color-dark)"
          :style="{
            '--color-light': `var(--color-${chip}-500)`,
            '--color-dark': `var(--color-${chip}-400)`,
          }"
        />
      </slot>
    </template>
  </UButton>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  chip?: string;
  icon?: string;
  selected?: boolean;
}>();

const slots = defineSlots<{
  leading: () => unknown;
}>();
</script>
