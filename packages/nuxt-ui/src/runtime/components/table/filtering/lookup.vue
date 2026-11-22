<template>
  <USelectMenu
    v-bind="$attrs"
    v-model:search-term="search"
    value-key="value"
    label-key="label"
    :model-value="selection"
    :placeholder="t('filtering.lookupPlaceholder')"
    :items="items"
    :loading="loading"
    multiple
    ignore-filter
    @update:model-value="update"
  >
    <template v-if="$slots.selection" #default="{ open }">
      <slot name="selection" :selection="selection" :items="items" :open="open" :update="update" />
    </template>
    <template v-if="$slots.option" #item="{ item, index }">
      <slot name="option" :item="item" :index="index" :selected="selection.includes(item.value)" />
    </template>
    <template v-if="$slots.empty" #empty="{ searchTerm }">
      <slot name="empty" :search-term="searchTerm" :loading="loading" />
    </template>
  </USelectMenu>
  <slot
    v-if="results.error.value || selected.error.value"
    name="error"
    :retry="retry"
    :search-error="results.error.value"
    :selection-error="selected.error.value"
  >
    <span role="status" class="text-error text-sm">
      {{ t('filtering.lookupError') }}
    </span>
  </slot>
</template>

<script setup lang="ts">
import { refDebounced } from '@vueuse/core';
import { computed, onMounted, ref, shallowRef, watch, type Ref } from 'vue';
import { useTableI18n } from '../../../composables/use-table-i18n';
import type { TableTextOverrides } from '../../../texts';
import type { FilterChoice, FilterLookupSource } from '../../../types/table';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  source: FilterLookupSource;
  maxSelections?: number;
  texts?: TableTextOverrides;
}>();
type LookupOption = FilterChoice & { disabled: boolean };

defineSlots<{
  selection?: (props: {
    selection: FilterChoice['value'][];
    items: LookupOption[];
    open: boolean;
    update: (values: FilterChoice['value'][]) => void;
  }) => unknown;
  option?: (props: { item: LookupOption; index: number; selected: boolean }) => unknown;
  empty?: (props: { searchTerm: string; loading: boolean }) => unknown;
  error?: (props: { retry: () => void; searchError: boolean; selectionError: boolean }) => unknown;
}>();

const selection = defineModel<FilterChoice['value'][]>({ required: true });
const search = ref('');
const retries = ref(0);
const retry = () => {
  retries.value++;
};
const t = useTableI18n(() => props.texts);

/** Loads each lookup independently and discards responses after a newer request or unmount. */
function load<T>(
  input: Ref<T>,
  request: (source: FilterLookupSource, value: T) => Promise<FilterChoice[]> | FilterChoice[],
) {
  const options = shallowRef<FilterChoice[]>([]);
  const loading = ref(false);
  const error = ref(false);
  onMounted(() =>
    watch(
      [input, () => props.source, retries],
      async ([value, source], _, onCleanup) => {
        let current = true;
        onCleanup(() => (current = false));
        loading.value = true;
        error.value = false;
        try {
          const choices = await request(source, value);
          if (current) options.value = choices;
        } catch {
          if (current) {
            options.value = [];
            error.value = true;
          }
        } finally {
          if (current) loading.value = false;
        }
      },
      { immediate: true },
    ),
  );
  return { options, loading, error };
}

const results = load(refDebounced(search, 250), (source, term) => source.search(term));
const selected = load(selection, (source, ids) => (ids.length ? source.resolve(ids) : []));
const loading = computed(() => results.loading.value || selected.loading.value);
const limit = computed(() => props.maxSelections ?? Infinity);
const items = computed(() => {
  const byValue = new Map<FilterChoice['value'], FilterChoice>();
  const selectedValues = new Set(selection.value);
  for (const option of [...selected.options.value, ...results.options.value]) byValue.set(option.value, option);
  return [...byValue.values()].map((option) => ({
    ...option,
    disabled: selection.value.length >= limit.value && !selectedValues.has(option.value),
  }));
});

/** Keeps removals available at the configured selection limit. */
function update(values: FilterChoice['value'][]): void {
  if (values.length <= limit.value || values.length < selection.value.length) selection.value = values;
}
</script>
