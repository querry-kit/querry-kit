# @querry-kit/nuxt-ui <!-- omit in toc -->

[![npm](https://img.shields.io/npm/v/%40querry-kit%2Fnuxt-ui?label=npm&logo=npm&logoColor=white&style=for-the-badge)](https://www.npmjs.com/package/@querry-kit/nuxt-ui)
[![npm downloads](https://img.shields.io/npm/dm/%40querry-kit%2Fnuxt-ui?label=downloads&logo=npm&logoColor=white&style=for-the-badge)](https://www.npmjs.com/package/@querry-kit/nuxt-ui)
[![license](https://img.shields.io/npm/l/%40querry-kit%2Fnuxt-ui?label=license&style=for-the-badge)](LICENSE)
[![node](https://img.shields.io/node/v/%40querry-kit%2Fnuxt-ui?label=node&logo=nodedotjs&logoColor=white&style=for-the-badge)](package.json)
[![bundle size](https://img.shields.io/bundlephobia/minzip/%40querry-kit%2Fnuxt-ui?label=size&logo=webpack&logoColor=white&style=for-the-badge)](https://bundlephobia.com/package/@querry-kit/nuxt-ui)
[![TypeScript](https://img.shields.io/badge/types-TypeScript-3178c6?logo=typescript&logoColor=white&style=for-the-badge)](https://www.typescriptlang.org/)
[![Buy Me a Coffee](https://img.shields.io/badge/buy_me_a_coffee-tobiaswaelde-ffdd00?logo=buymeacoffee&logoColor=000000&style=for-the-badge)](https://www.buymeacoffee.com/tobiaswaelde)

[![build](https://img.shields.io/github/actions/workflow/status/querry-kit/nuxt-ui/build.yml?branch=main&label=build&logo=githubactions&logoColor=white&style=for-the-badge)](https://github.com/querry-kit/nuxt-ui/actions/workflows/build.yml)
[![test](https://img.shields.io/github/actions/workflow/status/querry-kit/nuxt-ui/test.yml?branch=main&label=test&logo=vitest&logoColor=white&style=for-the-badge)](https://github.com/querry-kit/nuxt-ui/actions/workflows/test.yml)
[![coverage](https://img.shields.io/github/actions/workflow/status/querry-kit/nuxt-ui/test.yml?branch=main&label=coverage&logo=vitest&logoColor=white&style=for-the-badge)](https://github.com/querry-kit/nuxt-ui/actions/workflows/test.yml)
[![lint](https://img.shields.io/github/actions/workflow/status/querry-kit/nuxt-ui/lint.yml?branch=main&label=lint&logo=eslint&logoColor=white&style=for-the-badge)](https://github.com/querry-kit/nuxt-ui/actions/workflows/lint.yml)
[![changesets](https://img.shields.io/github/actions/workflow/status/querry-kit/nuxt-ui/changesets.yml?branch=main&label=changesets&logo=changesets&logoColor=white&style=for-the-badge)](https://github.com/querry-kit/nuxt-ui/actions/workflows/changesets.yml)
[![npm publish](https://img.shields.io/github/actions/workflow/status/querry-kit/nuxt-ui/release.yml?branch=main&label=npm%20publish&logo=githubactions&logoColor=white&style=for-the-badge)](https://github.com/querry-kit/nuxt-ui/actions/workflows/release.yml)

Composable Nuxt UI table controls for Query Kit applications: toolbar, sorting, filtering, column preferences, pagination and keyboard shortcuts. Every public component begins with `Q`, and the package does not depend on application stores, layouts or runtime configuration.

📖 Documentation: https://querry-kit.github.io/querry-kit/docs/nuxt-ui/

## 🌐 Querry Kit Ecosystem

The [Querry Kit overview](https://querry-kit.github.io/querry-kit/) connects the three main repositories:

- [`@querry-kit/nest`](https://github.com/querry-kit/nest) for the Query Kit-compatible NestJS API and controller patterns.
- [`@querry-kit/nuxt`](https://github.com/querry-kit/nuxt) for typed API clients and headless Vue/Nuxt data primitives.
- [`@querry-kit/nuxt-ui`](https://github.com/querry-kit/nuxt-ui) for Nuxt UI integrations built on these primitives.

It also contains the complete Workboard API-and-web-app example, which shows the packages working together end to end.

## 📚 Table of Contents <!-- omit in toc -->

- [🌐 Querry Kit Ecosystem](#-querry-kit-ecosystem)
- [📦 Install](#-install)
- [🚀 Release Workflow](#-release-workflow)
- [🧩 Usage](#-usage)
- [🧱 Components](#-components)
- [📖 Documentation](#-documentation)
- [🛠 Development](#-development)

## 📦 Install

```sh
pnpm add @querry-kit/nuxt @querry-kit/nuxt-ui @nuxt/ui @iconify-json/tabler
```

Register Nuxt UI before this module. The table controls use Tabler icons by default, so the host application must install `@iconify-json/tabler`. Components use the host application's `querrykit.table.*` i18n keys when available and otherwise fall back to English strings.

```ts
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@querry-kit/nuxt-ui'],
  querryKitUi: { autoImports: true },
});
```

Set `autoImports` to `false` when the application registers the components itself. The package never installs, configures, or ships an i18n provider. Pass nested `texts` or `icons` props for explicit overrides, or replace display regions with the documented slots.

Text overrides are reactive. Use `filtering.operatorField` and `filtering.valueField` for distinct field names, and
`filtering.operators` and `filtering.operatorDescriptions` for operator text. Group counts and full group labels
pass their numeric count to the host translator for plural selection. Supply `grouping.rowLabel` to control
word order with `{label}`, `{count}`, `{formattedCount}`, and `{countLabel}`. The controls use the host's
`$n` for display numbers when available. Set the Nuxt UI locale on `UApp` for native SelectMenu and
Pagination messages, including the lookup search placeholder and page navigation labels.

When overriding icons, install the matching Iconify collection in the host application. For example, install Lucide with `pnpm add @iconify-json/lucide` before passing `i-lucide-*` values. See [types, text, and icon customization](https://querry-kit.github.io/querry-kit/docs/nuxt-ui/api/types) for Lucide and Tabler examples.

Configure table-wide icon defaults in the host application's `app.config.ts`. A component's `icons` prop overrides this configuration, while the existing flat `icon` prop remains authoritative for an individual trigger:

```ts
export default defineAppConfig({
  querryKit: {
    table: {
      icons: {
        sorting: { trigger: 'i-lucide-arrow-up-down' },
        filtering: { trigger: 'i-lucide-list-filter' },
      },
    },
  },
});
```

The current package version is published on npm. npm is the primary distribution channel.

GitHub release tags remain available as a fallback:

```sh
pnpm add github:querry-kit/nuxt-ui#v0.0.1
```

## 🚀 Release Workflow

Releases are driven by Changesets and GitHub Actions. The `main` branch contains source, documentation and workflow configuration; published package files are built in CI.

Package-visible changes should include a changeset:

```sh
pnpm changeset
```

When changes land on `main`, the [changesets workflow](https://github.com/querry-kit/nuxt-ui/actions/workflows/changesets.yml) creates or updates a release PR. That PR contains the version bump and changelog updates produced by:

```sh
pnpm changeset version
```

The [npm publish workflow](https://github.com/querry-kit/nuxt-ui/actions/workflows/release.yml) uses npm Trusted Publishing through GitHub Actions OIDC. The npm package must be connected to this repository and workflow in the npm package publishing settings:

- Repository: `querry-kit/nuxt-ui`
- Workflow file: `release.yml`
- Environment: unset

After the release PR is merged, the publish workflow runs the package checks, builds the package, publishes `@querry-kit/nuxt-ui` to npm, tags the release as `vX.Y.Z`, and creates a GitHub Release.

Consumers should install from npm:

```sh
pnpm add @querry-kit/nuxt-ui
```

## 🧩 Usage

`QTableToolbar` composes a breadcrumb, search input, create action and table controls. It does not own table data or perform filtering itself: applications bind the models they need and receive immutable replacement values.

Pass `:selected-count="selectedIds.size"` to show a separate selection toolbar below the controls when the count is positive. It shows the total on the left and the contents of `#bulk-actions="{ selectedCount }"` on the right. Keep creation in `#new`.

Below `sm`, search appears as a magnifier button. Click it or press **Shift+/** to type; Escape or moving focus away collapses the field and keeps the search active.

Below the toolbar’s `sm` breakpoint (640 px by default), grouping, sorting, filtering, and column options open in dialogs. Only the body scrolls; the header and the footer with the Close button stay visible. Override the label with `texts.toolbar.close` or translate `querrykit.table.toolbar.close`. On wider screens, the controls open in popovers.

Use the `filter-context` slot for a project selector or other application-owned filter inside the filter panel. Bind `filter-context-active` to its active state and handle `clear-filters` to reset it.

Use `filter-item` to customize individual filter rows. The slot receives `filter`, `field`, `remove`, and `update`. Fields without custom slot content keep their default editor.

```vue
<QTableToolbar
  v-model:search="search"
  v-model:sorting="sorting"
  v-model:filtering="filtering"
  v-model:column-order="columnOrder"
  v-model:invisible-columns="invisibleColumns"
  v-model:column-pinning="columnPinning"
  :sortable-fields="sortableFields"
  :filter-fields="filterFields"
  :column-definitions="columns"
/>
```

Toolbar shortcuts are enabled by default: **Shift+G** groups, **Shift+F** filters, **Shift+S** sorts, **Shift+O** opens table options, **Shift+N** activates the create action, and **Shift+/** focuses search. Set `:shortcuts="false"` on the toolbar or an individual panel to opt out. A single button or link in `#new` works automatically; when the slot has multiple actions, mark the create trigger with `data-qk-new`.

See [types, text, and icon customization](https://querry-kit.github.io/querry-kit/docs/nuxt-ui/api/types) for the complete key list, examples, and slot customization.

## 🧱 Components

| Component          | Purpose                                                       | Documentation                                                                             |
| ------------------ | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `QTableToolbar`    | Combines breadcrumb, search, create actions and controls.     | [Table toolbar](https://querry-kit.github.io/querry-kit/docs/nuxt-ui/components/toolbar)  |
| `QTableSorting`    | Manages ordered sorting with ascending/descending directions. | [Sorting](https://querry-kit.github.io/querry-kit/docs/nuxt-ui/components/sorting)        |
| `QTableFiltering`  | Edits Query Kit-compatible `AND`/`OR` filtering state.        | [Filtering](https://querry-kit.github.io/querry-kit/docs/nuxt-ui/components/filtering)    |
| `QTableOptions`    | Reorders, hides, pins, and resets columns.                    | [Column options](https://querry-kit.github.io/querry-kit/docs/nuxt-ui/components/options) |
| `QTablePagination` | Renders a footer with optional pagination and infinite-scroll switching. | [Pagination](https://querry-kit.github.io/querry-kit/docs/nuxt-ui/components/pagination)  |

Public component types such as `FilterField`, `FilterFieldType`, `SortingState`, `Filtering`, `ColumnDefinition` and `ColumnPinning` are exported from `@querry-kit/nuxt-ui/types`. Query state contracts remain compatible with `@querry-kit/nuxt`.

### Searchable lookup filters

Use `QTableFilterLookup` as the component for a `select` field. Supply a
`FilterLookupSource` through `componentProps`. The source exposes `search(term)`
for matching choices and `resolve(values)` for selected labels, including values
from bookmarked filters. Each method returns `{ value, label }` choices. An empty
search loads the initial choices.

```ts
import { QTableFilterLookup } from '#components';
import type { FilterField } from '@querry-kit/nuxt-ui/types';

const projectField = {
  type: 'select',
  value: 'project.id',
  label: 'Project',
  component: QTableFilterLookup,
  componentProps: { source: projectLookup, maxSelections: 100 },
} satisfies FilterField;
```

The application supplies the endpoint, field path, and optional selection limit.
The lookup also works outside the filter toolbar with an array `v-model`, a
`source`, and an accessible label.

### Layout slots

- `QTableToolbar` exposes `layout` for the full arrangement and individual `grouping`, `sorting`, `filtering`, and
  `column-options` slots with model setters.
- `QTableGrouping` exposes `trigger`, `header`, `clear`, `items`, `item`, and `add` with grouping actions.
- `QTableFilterLookup` exposes `selection`, `option`, `empty`, and `error` with selection state and a retry action.
- `QTableGrouped` exposes `column-header`, `group-toggle`, `group-count`, `loading`, `empty`, `error`,
  `branch-controls`, `branch-error`, `group-footer`, and `pagination`. Bind the group toggle slot's `triggerProps`
  to a native button to retain keyboard and row activation. The pagination slot receives a branch path and paging actions.
- `QTablePagination` shows `summary` when it fits beside the controls. Use `start` for controls that must stay visible in the single-line footer.

## 📖 Documentation

- [Getting Started](https://querry-kit.github.io/querry-kit/docs/nuxt-ui/guide/getting-started)
- [Table Toolbar](https://querry-kit.github.io/querry-kit/docs/nuxt-ui/components/toolbar)
- [Sorting](https://querry-kit.github.io/querry-kit/docs/nuxt-ui/components/sorting)
- [Filtering](https://querry-kit.github.io/querry-kit/docs/nuxt-ui/components/filtering)
- [Column Options](https://querry-kit.github.io/querry-kit/docs/nuxt-ui/components/options)
- [Pagination](https://querry-kit.github.io/querry-kit/docs/nuxt-ui/components/pagination)

Bind `v-model:loading-mode` to opt in to the footer switch. For a flat table, pass
`loaded-items`, `has-more`, `loading`, and `error`, then handle `@load-more` for
automatic loading, keyboard-accessible loading, and retry. In a grouped table,
set `grouped` on the global footer and place numbered footers or
`QTableGroupLoadMore` inside each expanded leaf. Disable global shortcuts on
leaf footers with `:shortcuts="false"`. Pass `:page-sizes="[]"` when the page size
is controlled by the global footer.
- [Types, text, and icon customization](https://querry-kit.github.io/querry-kit/docs/nuxt-ui/api/types)

## 🛠 Development

```sh
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm build
```

`pnpm test:coverage` collects all source files, prints the coverage summary, and writes HTML and LCOV reports to `coverage/`. GitHub Actions runs the same command and retains the report as a workflow artifact.

Verify visual component changes through the corresponding live demo in the central documentation.

Dependency maintenance updates manifests and the pnpm lockfile within supported version ranges. The development toolchain pins patched transitive versions of glob, minimatch, and node-forge.

TanStack Table is not a direct peer dependency of this package. Table controls use Query Kit types; a consuming table renderer owns its TanStack version.

## Development toolchain

Use Node.js 26.13.0 LTS and the package manager pinned in `package.json`. This release requires Node.js 26.13.0 or newer and no longer supports Node.js 24. Upgrade application runtimes and CI before updating the package. Builds use TypeScript 7; ESLint and compiler-API consumers use the TypeScript 6 compatibility package. Dependency overrides, where present, pin security fixes for transitive packages; validate tests and documentation builds when changing them.

### Dependency maintenance

Development and type checks use Nuxt 4.6.4, Vue 3.5.46, Vite 8.3.8, and the exact `vue-tsc` 3.3.14 pin. Vitest and its V8 coverage provider use 5.1.1. VueUse 14 and 15 remain supported.

Dependency refreshes retain pnpm 11.28.9, the existing TypeScript 6/7 split, and security overrides. Candidates published less than 24 hours ago are deferred; dependency major migrations are outside this update.

## Server-backed grouping controls

Use `QTableGrouping` with `v-model:grouping` (an ordered string array) and
`fields` (`{ value, label, disabled? }[]`). Selected and disabled fields are excluded
from the add selector. Select a field and submit the form to append it.
The form stays visible and is disabled when no fields are available.
Reorder levels by dragging their handles or focusing a
handle and pressing Up or Down. Use the clear button in the header to remove all
levels. `QTableToolbar`
shows the control when it receives the grouping model and a nonempty `groupableFields` array.

`QTableGroup` takes `label`, `count`, `expanded`, optional `loading`/`error`, `texts`,
and `icons`. It emits `toggle` and `retry`; its default slot renders branch content.
The `header` slot receives `label`, `count`, and `expanded`. Expansion is controlled
by the parent; the trigger reports `aria-expanded` and native button keyboard behavior.

`QTableGroupLoadMore` takes `hasMore`, optional `loading`/`error`, and `texts`, and emits
`load`. It disables requests while loading and renders a retry action after errors.
Use it independently for the root, nested group lists, and leaf records.

```vue
<QTableGrouping v-model:grouping="table.grouping.value" :fields="groupableFields" />
<QTableGroup
  v-for="node in table.groups.value"
  :key="node.key"
  :label="String(node.value ?? 'No value')"
  :count="node.count"
  :expanded="node.expanded"
  :loading="node.loading"
  :error="node.error"
  @toggle="table.toggleGroup(node.path)"
  @retry="table.loadMoreGroups(node.path)"
>
  <!-- Render nested groups or application-owned leaf records here. -->
</QTableGroup>
<QTableGroupLoadMore
  :has-more="table.root.hasMore"
  :loading="table.root.loading"
  :error="table.root.error"
  @load="table.loadMoreGroups()"
/>
```

The example root has child grouping levels; at a leaf use `loadMoreItems(node.path)`
for retry and continuation. Group headers display full matching record counts, not
loaded record counts, when connected to `useGroupedTable` from `@querry-kit/nuxt`.
The application still owns table markup, columns, records, authentication, and API routes.

All labels live under `querrykit.table.grouping` for host i18n. `texts.grouping` supports
`title`, `field`, `add`, `remove`, `clear`, `moveUp`, `moveDown`, `count` (with `{count}`),
`loading`, `error`, `retry`, `loadMore`, `empty`, and `null`. `icons.grouping` supports
`trigger`, `up`, `down`, `remove`, `add`, `expanded`, and `collapsed` using existing
component/app-config/default precedence. Field labels and null-value labels are
application-owned; use the same locale as the rest of the table.

### Render groups as table rows

`QTableGrouped` renders the state returned by `useGroupedTable`. Start the query with
`table.initialize()` when the view mounts. Supply the current visible columns and use
`available-columns` when a grouped column can be hidden in the saved layout. The renderer accepts the structural `GroupedTableState` interface from `@querry-kit/nuxt-ui/types`.

```vue
<QTableGrouped
  :table="table"
  :columns="visibleColumns"
  :available-columns="allColumns"
  :get-id="(item) => item.id"
  label="Tasks"
>
  <template #cell="{ item, field }">{{ item[field] }}</template>
</QTableGrouped>
```

Add the package's `dist/runtime` directory as a Tailwind `@source` in your
application's stylesheet. Use a path relative to that stylesheet.

Each column needs an `id` and `header`. The renderer handles expansion, server sorting,
branch paging, and infinite loading. The group row provides the hover highlight. From 640 px, group columns stay pinned on the left in grouping order, after the optional selection column. Below 640 px, group columns scroll horizontally. Labels and counts can wrap instead of being cut off. Use `group-value` and `group-cell` to customize group
rows, `leading` and `leading-header` for selection controls, and `branch` with `show-branch`
for extra content under expanded groups. The `footer-start` slot can hold a loading-mode switch.

## Nuxt package compatibility

The table controls support `@querry-kit/nuxt` 0.2.x and 1.x. Use the 1.x package for `useGroupedTable`; existing controls remain compatible with 0.2.x consumers on the supported Node.js runtime.
