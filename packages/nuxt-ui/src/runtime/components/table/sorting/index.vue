<template>
  <ControlPanel
    v-model:open="open"
    popover-class="qk-table-sorting-popover"
    :title="t('sorting.title')"
    :texts="texts"
    anchored
    :popover-body-class="['p-2.5', ui?.content]"
    :body-class="ui?.content"
  >
    <template #trigger="{ dialog }">
      <slot name="trigger" :open="open" :toggle="toggle" :active="hasSorting">
        <UTooltip :text="t('sorting.title')" :kbds="shortcuts ? ['Shift', 'S'] : undefined" :disabled="open">
          <UButton
            variant="ghost"
            :aria-label="t('sorting.title')"
            :aria-keyshortcuts="shortcuts ? 'Shift+S' : undefined"
            :color="hasSorting ? 'primary' : 'neutral'"
            :icon="icon ?? tableIcon('sorting.trigger')"
            @click="!dialog && toggle()"
          />
        </UTooltip>
      </slot>
    </template>
    <template #header>
      <slot name="header" :sorting="sorting" :clear="clear">
        <SortingHeader :has-sorting="hasSorting" :texts="texts" :icons="icons" :clear="clear" />
      </slot>
    </template>
    <slot name="items" :sorting="sorting" :remove="remove" :toggle-direction="toggleDirection" :move="move">
      <SortingItems
        v-model:sorting="sorting"
        :has-sorting="hasSorting"
        :remove="remove"
        :toggle-direction="toggleDirection"
      >
        <template #item="itemProps">
          <slot name="item" v-bind="itemProps">
            <SortingItem
              :sort="itemProps.sort"
              :fields="fields"
              :texts="texts"
              :icons="icons"
              :remove="itemProps.remove"
              :toggle-direction="itemProps.toggleDirection"
              :show-drag-handle="itemProps.showDragHandle"
            />
          </slot>
        </template>
      </SortingItems>
    </slot>
    <USeparator v-if="hasSorting && availableFields.length" class="my-2" />
    <slot name="add" :available-fields="availableFields" :add="add">
      <SortingAdd :fields="availableFields" :texts="texts" :icons="icons" :add="add" />
    </slot>
  </ControlPanel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTableI18n } from '../../../composables/use-table-i18n';
import { useTableIcons } from '../../../composables/use-table-icons';
import type { TableIconOverrides } from '../../../icons';
import type { TableTextOverrides } from '../../../texts';
import ControlPanel from '../toolbar/control-panel.vue';
import type { SortingField, SortingState } from '../../../types/table';
import { useTableShortcut } from '../../../composables/use-table-shortcut';
import SortingAdd from './add.vue';
import SortingHeader from './header.vue';
import SortingItem from './item.vue';
import SortingItems from './items.vue';

const props = withDefaults(
  defineProps<{
    fields: SortingField[];
    icon?: string;
    shortcuts?: boolean;
    texts?: TableTextOverrides;
    icons?: TableIconOverrides;
    ui?: { content?: string };
  }>(),
  { shortcuts: true },
);
const sorting = defineModel<SortingState>('sorting', { required: true });
const open = ref(false);
const t = useTableI18n(() => props.texts);
const tableIcon = useTableIcons(props.icons);
const hasSorting = computed(() => sorting.value.length > 0);
const availableFields = computed(() =>
  props.fields.filter((field) => !field.disabled && !sorting.value.some((sort) => sort.id === field.value)),
);
const toggle = () => (open.value = !open.value);
const clear = () => (sorting.value = []);
const add = (id: string) => {
  if (!sorting.value.some((sort) => sort.id === id)) sorting.value = [...sorting.value, { id, desc: false }];
};
const remove = (id: string) => (sorting.value = sorting.value.filter((sort) => sort.id !== id));
const toggleDirection = (id: string) =>
  (sorting.value = sorting.value.map((sort) => (sort.id === id ? { ...sort, desc: !sort.desc } : sort)));
const move = (from: number, to: number) => {
  const next = [...sorting.value];
  const [item] = next.splice(from, 1);
  if (item) next.splice(to, 0, item);
  sorting.value = next;
};
useTableShortcut(
  's',
  () => props.shortcuts,
  () => {
    toggle();
  },
);
</script>

<style>
.qk-table-sorting-popover {
  min-width: min(20rem, calc(100vw - 1rem));
}
</style>
