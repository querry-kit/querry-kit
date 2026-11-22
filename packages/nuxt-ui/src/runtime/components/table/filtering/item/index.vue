<template>
  <span class="text-muted grow truncate text-sm">{{ field?.label ?? filter.field }}</span>
  <FilteringItemBoolean
    v-if="filter.type === FilterFieldType.Boolean"
    :filter="filter"
    :label="field?.label ?? filter.field"
    :texts="texts"
    :update="update"
  />
  <FilteringItemNumber
    v-else-if="filter.type === FilterFieldType.Number"
    :filter="filter"
    :label="field?.label ?? filter.field"
    :texts="texts"
    :update="update"
  />
  <FilteringItemSelect
    v-else-if="field?.type === FilterFieldType.Select"
    :filter="filter"
    :label="field?.label ?? filter.field"
    :texts="texts"
    :field="field as FilterFieldSelect | undefined"
    :update="update"
  />
  <FilteringItemEnum
    v-else
    :filter="filter"
    :label="field?.label ?? filter.field"
    :texts="texts"
    :field="field as FilterFieldEnum | undefined"
    :update="update"
  />
  <UButton
    color="error"
    size="sm"
    variant="outline"
    :icon="icon('filtering.remove')"
    :aria-label="t('filtering.remove')"
    @click="remove"
  />
</template>

<script setup lang="ts">
import { useTableI18n } from '../../../../composables/use-table-i18n';
import { useTableIcons } from '../../../../composables/use-table-icons';
import type { TableIconOverrides } from '../../../../icons';
import type { TableTextOverrides } from '../../../../texts';
import {
  FilterFieldType,
  type FilterField,
  type FilterFieldEnum,
  type FilterFieldSelect,
  type FilteringField,
} from '../../../../types/table';
import FilteringItemBoolean from './boolean.vue';
import FilteringItemEnum from './enum.vue';
import FilteringItemNumber from './number.vue';
import FilteringItemSelect from './select.vue';

const props = defineProps<{
  filter: FilteringField;
  field?: FilterField;
  texts?: TableTextOverrides;
  icons?: TableIconOverrides;
  remove: () => void;
  update: (patch: Partial<FilteringField>) => void;
}>();
const t = useTableI18n(() => props.texts);
const icon = useTableIcons(props.icons);
</script>
