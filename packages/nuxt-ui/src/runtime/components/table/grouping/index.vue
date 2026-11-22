<template>
  <ControlPanel
    v-model:open="open"
    :title="t('grouping.title')"
    :texts="texts"
    :popover-class="['qk-table-grouping-popover', ui?.popover].filter(Boolean).join(' ')"
    :popover-body-class="['space-y-2 p-3', ui?.content]"
    :body-class="['space-y-2', ui?.content].filter(Boolean).join(' ')"
  >
    <template #trigger>
      <slot name="trigger" :open="open" :active="Boolean(grouping.length)" :set-open="setOpen">
        <UTooltip :text="t('grouping.title')" :kbds="shortcuts ? ['Shift', 'G'] : undefined" :disabled="open">
          <UButton
            variant="ghost"
            :color="grouping.length ? 'primary' : 'neutral'"
            :aria-label="t('grouping.title')"
            :aria-keyshortcuts="shortcuts ? 'Shift+G' : undefined"
            :icon="icon('grouping.trigger')"
          />
        </UTooltip>
      </slot>
    </template>
    <template #header>
      <div class="mb-4 flex items-center justify-between gap-2">
        <slot name="header" :grouping="grouping" :clear="clear">
          <h3 class="flex items-center gap-2 text-sm font-medium">
            <UIcon :name="icon('grouping.trigger')" />
            {{ t('grouping.title') }}
          </h3>
        </slot>
        <slot name="clear" :grouping="grouping" :clear="clear">
          <UButton
            v-if="grouping.length"
            color="error"
            size="xs"
            variant="outline"
            :icon="icon('grouping.clear')"
            :aria-label="t('grouping.clear')"
            @click="clear"
          />
        </slot>
      </div>
    </template>
    <slot name="items" :grouping="grouping" :move="move" :remove="remove" :set-grouping="setGrouping">
      <VueDraggable v-model="grouping" class="space-y-2" tag="ol" handle=".drag-handle" :animation="150">
        <li v-for="(field, index) in grouping" :key="field" class="flex items-center gap-2">
          <slot
            name="item"
            :field="field"
            :label="fieldLabel(field)"
            :index="index"
            :move="move"
            :remove="remove"
            :handle-class="'drag-handle'"
          >
            <UButton
              v-if="grouping.length > 1"
              class="drag-handle shrink-0 cursor-grab touch-none"
              color="neutral"
              size="xs"
              variant="ghost"
              aria-keyshortcuts="ArrowUp ArrowDown"
              :icon="icon('options.drag')"
              :aria-label="t('grouping.reorder', { field: fieldLabel(field) })"
              @keydown.up.prevent.stop="moveWithFocus($event, index, -1)"
              @keydown.down.prevent.stop="moveWithFocus($event, index, 1)"
            />
            <span class="text-muted min-w-0 flex-1 truncate text-sm">{{ fieldLabel(field) }}</span>
            <UButton
              color="error"
              size="sm"
              variant="outline"
              :aria-label="t('grouping.remove')"
              :icon="icon('grouping.remove')"
              @click="remove(field)"
            />
          </slot>
        </li>
      </VueDraggable>
    </slot>
    <USeparator v-if="grouping.length" class="my-2" />
    <slot name="add" :available-fields="available" :add="add">
      <form class="flex gap-2" @submit.prevent="addSelected">
        <USelect
          v-model="selected"
          class="w-full"
          size="sm"
          value-key="value"
          :items="available"
          :placeholder="t(available.length ? 'grouping.field' : 'grouping.noFields')"
          :aria-label="t('grouping.field')"
          :disabled="!available.length"
        />
        <UButton
          size="sm"
          type="submit"
          :aria-label="t('grouping.add')"
          :icon="icon('grouping.add')"
          :disabled="!selectedField"
        />
      </form>
    </slot>
  </ControlPanel>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { useTableI18n } from '../../../composables/use-table-i18n';
import { useTableIcons } from '../../../composables/use-table-icons';
import { useTableShortcut } from '../../../composables/use-table-shortcut';
import type { TableTextOverrides } from '../../../texts';
import ControlPanel from '../toolbar/control-panel.vue';
import type { TableIconOverrides } from '../../../icons';
import type { GroupingField } from '../../../types/table';

/** Ordered scalar grouping control; the application owns the selected state. */
const props = withDefaults(
  defineProps<{
    fields: readonly GroupingField[];
    /** Enables Shift+G on the grouping control. Defaults to true. */
    shortcuts?: boolean;
    texts?: TableTextOverrides;
    icons?: TableIconOverrides;
    ui?: { popover?: string; content?: string };
  }>(),
  { shortcuts: true },
);
const grouping = defineModel<string[]>('grouping', { required: true });
const selected = ref<string>();
const open = ref(false);
useTableShortcut(
  'g',
  () => props.shortcuts,
  () => {
    open.value = !open.value;
  },
);
const setOpen = (value: boolean) => (open.value = value);
const setGrouping = (value: string[]) => (grouping.value = value);
const clear = () => setGrouping([]);
const t = useTableI18n(() => props.texts);
const icon = useTableIcons(props.icons);
const available = computed(() =>
  props.fields.filter((field) => !field.disabled && !grouping.value.includes(field.value)),
);
const selectedField = computed(() => available.value.find((field) => field.value === selected.value));

/**
 * Resolves the display label for a grouping field.
 *
 * @param {string} field The grouping field ID.
 * @returns {string} The configured label or field ID.
 */
const fieldLabel = (field: string) => props.fields.find((item) => item.value === field)?.label ?? field;

/** Adds the selected field if it is still available and clears the selection. */
const addSelected = () => {
  if (selectedField.value) add(selectedField.value.value);
  selected.value = undefined;
};

/** Adds a field that is still available. */
const add = (field: string) => {
  if (available.value.some((item) => item.value === field)) setGrouping([...grouping.value, field]);
};

/**
 * Removes a grouping field from the ordered selection.
 *
 * @param {string} field The field ID to remove.
 */
const remove = (field: string) => {
  grouping.value = grouping.value.filter((value) => value !== field);
};

/** Moves a grouping field by one position. */
const move = (index: number, direction: number): boolean => {
  const next = [...grouping.value];
  const target = index + direction;
  if (target < 0 || target >= next.length) return false;

  [next[index], next[target]] = [next[target]!, next[index]!];
  setGrouping(next);
  return true;
};

/** Preserves focus on the moved handle during keyboard reordering. */
const moveWithFocus = (event: KeyboardEvent, index: number, direction: number) => {
  const handle = event.currentTarget as HTMLButtonElement;
  if (move(index, direction)) void nextTick(() => handle.focus());
};
</script>

<style>
.qk-table-grouping-popover {
  min-width: min(30rem, calc(100vw - 1rem));
}
</style>
