# Catalog navigation contract

Routes below are relative to `/docs/nuxt-ui/components/`. Section names identify the intended reader destination; verify generated heading IDs before setting card URLs.

| Category | Public card name | Destination | Preview cue |
| --- | --- | --- | --- |
| Table controls | QTableToolbar | toolbar | Search and actions in a toolbar |
| Table controls | QTableSorting | sorting | Two ordered sort fields |
| Table controls | QTableOptions | options | Visible and hidden columns |
| Table controls | QTablePagination | pagination | Current page and adjacent pages |
| Filtering | QTableFiltering | filtering | Field, operator and value |
| Filtering | QTableFilterLookup | filtering, Searchable lookup filters | Search and matching option |
| Grouping | QTableGrouping | grouping, QTableGrouping | Ordered grouping levels |
| Grouping | QTableGrouped | grouping, QTableGrouped | Tree of grouped rows |
| Grouping | QTableGroup | grouping, QTableGroup | Expanded label and count |
| Grouping | QTableGroupLoadMore | grouping, QTableGroupLoadMore | Load more below leaf rows |

Expose separate targets for the last two cards while preserving the existing shared heading ID. Cards must use internal router-aware links that work at the configured deployment base. Each card has an accessible link name containing the exact public component name.
