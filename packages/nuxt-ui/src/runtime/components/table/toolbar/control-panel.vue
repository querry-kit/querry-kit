<template>
  <UModal
    v-if="isSmall"
    v-model:open="open"
    :title="title"
    modal
    :content="{ 'aria-modal': true }"
    :close="false"
    :scrollable="false"
    :ui="{
      content: 'qk-table-toolbar-dialog',
      wrapper: 'sr-only',
    }"
  >
    <slot name="trigger" :dialog="true" />
    <template #actions>
      <div class="qk-table-toolbar-dialog-header">
        <slot name="header" />
      </div>
    </template>
    <template #body>
      <div :class="bodyClass">
        <slot />
      </div>
    </template>
    <template #footer="{ close }">
      <UButton color="neutral" variant="outline" :label="t('toolbar.close')" @click="close" />
    </template>
  </UModal>

  <template v-else>
    <span v-if="anchored" ref="anchor">
      <slot name="trigger" :dialog="false" />
    </span>
    <UPopover
      v-model:open="open"
      :reference="anchor"
      :content="popoverContent"
      :ui="{ content: popoverClass }"
      :modal="anchored ? false : undefined"
    >
      <template v-if="!anchored" #default>
        <slot name="trigger" :dialog="false" />
      </template>
      <template #content>
        <div :class="popoverBodyClass">
          <slot name="header" />
          <slot />
        </div>
      </template>
    </UPopover>
  </template>
</template>

<script setup lang="ts">
import { computed, inject, useTemplateRef } from 'vue';
import { useTableI18n } from '../../../composables/use-table-i18n';
import type { TableTextOverrides } from '../../../texts';
import { toolbarSmallKey } from './context';

const props = defineProps<{
  title: string;
  anchored?: boolean;
  popoverClass: string;
  popoverBodyClass: Array<string | undefined>;
  bodyClass?: string;
  texts?: TableTextOverrides;
}>();

defineSlots<{
  trigger(props: { dialog: boolean }): unknown;
  header(): unknown;
  default(): unknown;
}>();

const open = defineModel<boolean>('open', { required: true });
const isSmall = inject(toolbarSmallKey);
const anchor = useTemplateRef('anchor');
const t = useTableI18n(() => props.texts);
const popoverContent = computed(() =>
  props.anchored
    ? { align: 'start' as const, side: 'bottom' as const, sideOffset: 8, 'aria-label': props.title }
    : undefined,
);
</script>

<style>
.qk-table-toolbar-dialog {
  width: calc(100% - 2rem);
  max-height: calc(100dvh - 2rem);
  overflow: hidden;
}

.qk-table-toolbar-dialog > [data-slot='header'],
.qk-table-toolbar-dialog > [data-slot='footer'] {
  flex-shrink: 0;
}

.qk-table-toolbar-dialog > [data-slot='body'] {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.qk-table-toolbar-dialog > [data-slot='footer'] {
  justify-content: flex-end;
}

.qk-table-toolbar-dialog-header {
  width: 100%;
}

.qk-table-toolbar-dialog-header > * {
  margin-bottom: 0;
}
</style>
