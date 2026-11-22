<template>
  <ControlPanel
    v-model:open="open"
    popover-class="qk-table-filtering-popover"
    :title="t('filtering.title')"
    :texts="texts"
    anchored
    :popover-body-class="['p-2.5', ui?.content]"
    :body-class="ui?.content"
  >
    <template #trigger="{ dialog }">
      <slot name="trigger" :open="open" :toggle="toggle" :active="hasActiveFilters">
        <UTooltip :text="t('filtering.title')" :kbds="shortcuts ? ['Shift', 'F'] : undefined" :disabled="open">
          <UButton
            variant="ghost"
            :aria-label="t('filtering.title')"
            :aria-keyshortcuts="shortcuts ? 'Shift+F' : undefined"
            :color="hasActiveFilters ? 'primary' : 'neutral'"
            :icon="icon ?? tableIcon('filtering.trigger')"
            @click="!dialog && toggle()"
          />
        </UTooltip>
      </slot>
    </template>
    <template #header>
      <slot name="header" :filtering="filtering" :clear="clear" :toggle-mode="toggleMode">
        <FilteringHeader
          :filtering="filtering"
          :has-filters="hasActiveFilters"
          :texts="texts"
          :icons="icons"
          :clear="clear"
          :toggle-mode="toggleMode"
        />
      </slot>
    </template>
    <slot name="context" />
    <slot name="items" :filters="filtering.filters" :remove="remove" :update="update">
      <FilteringItems
        :filters="filtering.filters"
        :fields="fields"
        :has-filters="hasFilters"
        :remove="remove"
        :update="update"
      >
        <template #item="itemProps">
          <slot name="item" v-bind="itemProps">
            <FilteringItem
              :filter="itemProps.filter"
              :field="itemProps.field"
              :texts="texts"
              :icons="icons"
              :remove="itemProps.remove"
              :update="itemProps.update"
            />
          </slot>
        </template>
      </FilteringItems>
    </slot>
    <USeparator v-if="hasFilters" class="my-2" />
    <slot name="add" :fields="availableFields" :add="add">
      <FilteringAdd :fields="availableFields" :texts="texts" :icons="icons" :add="add" />
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
import { FilteringMode, type FilterField, type Filtering, type FilteringField } from '../../../types/table';
import { createFilter } from '../../../utils/filtering';
import { useTableShortcut } from '../../../composables/use-table-shortcut';
import FilteringAdd from './add.vue';
import FilteringHeader from './header.vue';
import FilteringItem from './item/index.vue';
import FilteringItems from './items.vue';

const props = withDefaults(
  defineProps<{
    fields: FilterField[];
    /** Whether the application has an active filter in the context slot. */
    contextActive?: boolean;
    icon?: string;
    shortcuts?: boolean;
    texts?: TableTextOverrides;
    icons?: TableIconOverrides;
    ui?: { content?: string };
  }>(),
  { shortcuts: true, contextActive: false },
);
const filtering = defineModel<Filtering>('filtering', { required: true });
const emit = defineEmits<{ clear: [] }>();
const open = ref(false);
const t = useTableI18n(() => props.texts);
const tableIcon = useTableIcons(props.icons);
const hasFilters = computed(() => filtering.value.filters.length > 0);
const hasActiveFilters = computed(() => hasFilters.value || props.contextActive);
const availableFields = computed(() => props.fields.filter((field) => !field.disabled));
const toggle = () => (open.value = !open.value);
const clear = () => {
  filtering.value = { operator: FilteringMode.Intersect, filters: [] };
  emit('clear');
};
const toggleMode = () =>
  (filtering.value = {
    ...filtering.value,
    operator: filtering.value.operator === FilteringMode.Intersect ? FilteringMode.Union : FilteringMode.Intersect,
  });
const add = (id: string) => {
  const field = props.fields.find((field) => field.value === id);
  if (field) filtering.value = { ...filtering.value, filters: [...filtering.value.filters, createFilter(field)] };
};
const remove = (id: string) =>
  (filtering.value = { ...filtering.value, filters: filtering.value.filters.filter((filter) => filter.id !== id) });
const update = (id: string, patch: Partial<FilteringField>) =>
  (filtering.value = {
    ...filtering.value,
    filters: filtering.value.filters.map((filter) => (filter.id === id ? { ...filter, ...patch } : filter)),
  });
useTableShortcut(
  'f',
  () => props.shortcuts,
  () => {
    toggle();
  },
);
</script>

<style>
.qk-table-filtering-popover {
  min-width: min(30rem, calc(100vw - 1rem));
}

.qk-table-filtering-value {
  width: 12rem;
  min-width: 12rem;
  max-width: 12rem;
}
</style>
