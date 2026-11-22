import type {
  FilterFieldDefinition,
  FilteringField as QueryKitFilteringField,
  FilteringFieldOperator as QueryKitFilteringFieldOperator,
  FilteringMode as QueryKitFilteringMode,
  FilteringState as QueryKitFilteringState,
  SortingField as QueryKitSortingField,
  SortingRule,
} from '@querry-kit/nuxt/types';
import type { Component } from 'vue';

export type { TableIconKey, TableIconOverrides, TableIcons } from '../icons';

/** Ordered sort instructions; `desc: false` represents ascending order. */
export type SortingState = SortingRule[];
/** A selectable field in the sorting control. */
export type SortingField = QueryKitSortingField<{ disabled?: boolean }>;
/** A selectable scalar grouping field, sharing the field-control metadata contract. */
export type GroupingField = SortingField;

/** Editor variants supported by the filtering control. */
export const FilterFieldType = {
  Boolean: 'boolean',
  Number: 'number',
  Enum: 'enum',
  Select: 'select',
} as const;
export type FilterFieldType = (typeof FilterFieldType)[keyof typeof FilterFieldType];

/** Combines filters either as an intersection (`AND`) or union (`OR`). */
export const FilteringMode = {
  Intersect: 'AND',
  Union: 'OR',
} as const;
export type FilteringMode = QueryKitFilteringMode;
/** Operators emitted for number, enum and select filter values. */
export const FilteringFieldOperator = {
  In: 'in',
  NotIn: 'notIn',
  Equals: 'equals',
  NotEquals: 'not',
  LessThan: 'lt',
  LessThanOrEqual: 'lte',
  GreaterThan: 'gt',
  GreaterThanOrEqual: 'gte',
} as const satisfies Record<string, QueryKitFilteringFieldOperator>;
export type FilteringFieldOperator = QueryKitFilteringFieldOperator;

/** Shared metadata for a selectable filter field. */
export type FilterFieldBase = FilterFieldDefinition<FilterFieldType, { disabled?: boolean }>;
/** Boolean filter field, initialized with `true`. */
export type FilterFieldBoolean = FilterFieldBase & { type: typeof FilterFieldType.Boolean };
/** Numeric filter field, initialized with equality and `0`. */
export type FilterFieldNumber = FilterFieldBase & { type: typeof FilterFieldType.Number };
/** A labelled option for enum-style filters. */
export type FilterChoice = { value: string | number; label: string };
/** App-owned option requests for a searchable filter. Empty search loads the initial choices. */
export interface FilterLookupSource {
  /** Returns choices matching the search text. */
  search(term: string): Promise<FilterChoice[]>;
  /** Resolves selected values independently of the current search. */
  resolve(values: readonly FilterChoice['value'][]): Promise<FilterChoice[]>;
}
/** Enum filter field with optional replacement editor component. */
export type FilterFieldEnum = FilterFieldBase & {
  type: typeof FilterFieldType.Enum;
  values: FilterChoice[];
  component?: Component;
};
/** Select filter field with a consumer-provided editor component. */
export type FilterFieldSelect = FilterFieldBase & {
  type: typeof FilterFieldType.Select;
  component: Component;
  /** Additional props for the editor. The filter owns its value and update events. */
  componentProps?: Record<string, unknown>;
};
/** Union of every filter-field definition accepted by the control. */
export type FilterField = FilterFieldBoolean | FilterFieldNumber | FilterFieldEnum | FilterFieldSelect;
/** A single Query Kit-compatible filtering instruction. */
export type FilteringField = QueryKitFilteringField<
  FilterFieldType,
  FilteringFieldOperator,
  string | number | boolean | Array<string | number>
>;
/** Filtering state emitted by `QTableFiltering`. */
export type Filtering = QueryKitFilteringState<FilteringField>;
/** A displayable table column and its visibility constraints. */
export type ColumnDefinition = { id: string; header: string; enableHiding?: boolean; disabled?: boolean };
/** IDs pinned at the beginning or end of a table. */
export type ColumnPinning = { left?: string[]; right?: string[] };

export type {
  GroupedTableBranch,
  GroupedTableColumn,
  GroupedTableNode,
  GroupedTablePaginationSlot,
  GroupedTablePath,
  GroupedTableState,
} from './grouped-table';
