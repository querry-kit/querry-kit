import type { SortingRule } from '@querry-kit/nuxt/types';
import type { Ref } from 'vue';

/** Ordered equality predicates identifying a group in the renderer. */
export type GroupedTablePath = readonly { field: string; value: string | number | boolean | null }[];

/** Records, child groups, and request state for one branch of the table. */
export interface GroupedTableBranch<TItem> {
  children: GroupedTableNode<TItem>[];
  items: TItem[];
  loading: boolean;
  error: unknown;
  hasMore: boolean;
}

/** A group row and the branch it reveals. */
export interface GroupedTableNode<TItem> extends GroupedTableBranch<TItem> {
  key: string;
  path: GroupedTablePath;
  field: string;
  value: GroupedTablePath[number]['value'];
  count: number;
  /** Optional server-side sums over all matching records in the group. */
  sum?: Partial<Record<Extract<keyof TItem, string>, number | null>>;
  expanded: boolean;
  loaded: boolean;
}

/** Display information for a column rendered by QTableGrouped. */
export interface GroupedTableColumn {
  id: string;
  header: string;
  /** Preferred column width in pixels in grouped mode. */
  width?: number;
  align?: 'left' | 'right';
  sortable?: boolean;
  groupedCellClass?: string;
}

/** State and actions supplied by useGroupedTable or a compatible consumer. */
export interface GroupedTableState<TItem> {
  root: GroupedTableBranch<TItem>;
  groups: Readonly<Ref<GroupedTableNode<TItem>[]>>;
  allGroupsExpanded: Readonly<Ref<boolean>>;
  grouping: Readonly<Ref<string[]>>;
  loadingMode: Readonly<Ref<'pagination' | 'infinite'>>;
  sorting: Ref<SortingRule[]>;
  columnPinning: Readonly<Ref<Record<string, string[]>>>;
  itemsPerPage: Ref<number>;
  toggleGroup(path: GroupedTablePath): Promise<void>;
  setAllGroupsExpanded(expanded: boolean): Promise<void>;
  loadMoreGroups(path?: GroupedTablePath): Promise<void>;
  loadMoreItems(path: GroupedTablePath): Promise<void>;
  getItemPage(path?: GroupedTablePath): { page: number; totalItems: number; requestedPage?: number };
  loadItemsPage(path: GroupedTablePath, page: number): Promise<void>;
}

/** State and actions exposed by the grouped renderer's pagination slot. */
export interface GroupedTablePaginationSlot {
  path: GroupedTablePath;
  page: number;
  totalItems: number;
  itemsPerPage: number;
  loadedItems: number;
  loading: boolean;
  error: unknown;
  infinite: boolean;
  hasMore: boolean;
  setPage: (page: number) => void;
  setItemsPerPage: (size: number) => void;
  loadMore: () => void;
}
