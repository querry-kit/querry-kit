# @querry-kit/nuxt-ui

## 4.3.0

### Minor Changes

- d492ab9: Show an expandable icon-only search button on small screens.
- d492ab9: Enable standard keyboard shortcuts for grouping, filtering, sorting, table options, creating a record, and focusing search.
- d492ab9: Show a separate selection toolbar with a count and a slot for bulk actions.

### Patch Changes

- d492ab9: Pin grouping columns on the left from 640 px, let them scroll on mobile, and wrap group values and counts instead of truncating them.
- d492ab9: Keep pagination on one row with small controls. Show the full summary only when the footer has space for it.
- d492ab9: Label the page-size menu and contain table errors in a padded toolbar without horizontal overflow.
- d492ab9: Show a pointer on enabled toolbar buttons and keyboard shortcut hints in the search field and toolbar tooltips.
- d492ab9: Build and test against Vue 3.5.46 and @querry-kit/nuxt 1.1.1.

## 4.2.0

### Minor Changes

- 293e51a: Add scoped layout slots for toolbar controls, grouping, lookup choices, and grouped table regions while preserving the default layouts.
- ee008f3: Localize filter operators, grouped row labels, and pagination names, and keep explicit text overrides reactive.
- cde7768: Add an optional footer switch between pagination and infinite scroll, with automatic flat-row loading and accessible load and retry controls.

### Patch Changes

- 875d27a: Open table toolbar controls in dialogs on small screens, with a scrollable body, fixed header and footer, and a localized close button.
- 695c24d: Refresh and verify compatible Nuxt UI and development dependencies.
- 8800fc6: Keep loading mode selection and page navigation reachable at narrow widths and after appending rows.

## 4.1.0

### Minor Changes

- 7930ebd: Allow table toolbars to render application-owned filters inside the filter popover and include them in its active and clear states.
- 3e00d15: Add QTableGrouped for inline server-backed group rows, branch pagination, and infinite loading.
- 772de56: Reorder grouping fields with draggable, keyboard-accessible handles. The grouping popover adds a persistent field form, a clear button in the header, and the same responsive minimum width as the filter popover.
- 7930ebd: Add a Reset layout button to restore the declared column order, show all columns, and clear column pinning.
- 05eb052: Add a searchable multi-select filter with app-provided search, selected-value lookup, and selection limits.
- 7930ebd: Allow toolbars to customize individual filter rows. Highlight active grouping and show a red reset icon only for customized column layouts.

### Patch Changes

- 49c65a6: Keep grouped renderer types compatible with both supported Nuxt peer versions.
- 256c0fe: Highlight the entire group row on hover and keep the disclosure button keyboard accessible.
- 5146417: Use patched transitive versions of glob, minimatch, and node-forge in the development toolchain.
- 093da33: Keep group counts visible when group labels fill a fixed-width table column.

## 4.0.0

### Major Changes

- 9e4f642: Require Node.js 26.13.0 or newer and drop Node.js 24 support. Upgrade application runtimes and CI before updating.

### Minor Changes

- 4aa0d69: Add ordered grouping controls, accessible group headers and lazy-load actions.
- 732df4d: Declare compatibility with the Nuxt package 1.x for grouped tables.

### Patch Changes

- 9e4f642: Refresh compatible dependencies and the lockfile while preserving the TypeScript compatibility toolchain and security overrides.
- 4aa0d69: Keep grouping documentation aligned with the current Node.js 26 baseline.

## 3.3.10

### Patch Changes

- 2d79dac: Declare tested VueUse 15 compatibility alongside existing VueUse 14 support. Update development serializer tooling to patched serialize-javascript 7.1.4.

## 3.3.9

### Patch Changes

- dcf71ce: Update stable dependencies and security fixes, and move development, CI, and application images to Node.js 26 LTS. Application runtimes now require Node.js 26; public library runtime support is preserved. TypeScript 7 builds use the TypeScript 6 compatibility API for lint and test tooling.

## 3.3.8

### Patch Changes

- 6024d61: Remove the unused direct TanStack Table peer so consuming table renderers can manage their own dependency.

## 3.3.7

### Patch Changes

- 93b7581: Refresh dependencies within their supported version ranges.

## 3.3.6

### Patch Changes

- f4bc73a: Resolve vulnerable transitive development dependencies.

## 3.3.5

### Patch Changes

- aaa692e: Give table control popovers, field selectors, search inputs and filter editors accessible names.

## 3.3.4

### Patch Changes

- 26f4088: Keep multi-select filter controls at a stable width as values are selected.

## 3.3.3

### Patch Changes

- 15affc2: Update the Nuxt UI development dependency baseline.

## 3.3.2

### Patch Changes

- 214d153: Update the development Vue version to 3.5.42.
- 56656d9: Update Vue Test Utils to 2.5.0.

## 3.3.1

### Patch Changes

- 374b90e: Fix the automated version pull request workflow for Changesets v2.
- 7295381: Resolve vulnerable transitive editor, query parser, and SVG optimizer versions.
- cc821a8: Align the responsive table toolbar layout and popover sizing with dashboard toolbars.

## 3.3.0

### Minor Changes

- 50f0deb: Align sorting and column options with drag-and-drop pinning controls.

## 3.2.1

### Patch Changes

- 16e8284: Keep the central documentation changelog in sync after releases.

## 3.2.0

### Minor Changes

- 4041ec4: Add nested table-icon overrides through component props and host `app.config.ts`.

### Patch Changes

- a822796: Update transitive dependencies to resolve security alerts.

## 3.1.2

### Patch Changes

- 00c23f7: Add security reporting and repository maintenance configuration.

## 3.1.1

### Patch Changes

- 138128e: Fix release artifact verification for the table toolbar.

## 3.1.0

### Minor Changes

- 699c3cf: Build table filtering and sorting types on the shared `@querry-kit/nuxt` contracts.

### Patch Changes

- 38952fc: Use the published Nuxt package during CI builds.

## 3.0.0

### Major Changes

- b16a56f: Split table controls into internal components, retain `QTable*` as the public Nuxt component names, and replace bundled locale payloads with host-app `querrykit.table.*` keys, nested `texts` overrides, and English fallbacks.

## 2.0.1

### Patch Changes

- a4cdae6: Publish the table runtime components in the npm package.

## 2.0.0

### Major Changes

- fd84f17: Rename public table components from the `QuerryKit` prefix to the `Q` prefix.

## 1.0.0

### Major Changes

- df6d24a: Make i18n optional, add English text defaults and text overrides, and namespace i18n messages under `@querry-kit.table`.

## 0.1.2

### Patch Changes

- fa4fb3a: Standardize the English README and contributor guidance.

## 0.1.1

### Patch Changes

- 21de1ff: Improve the package README with status badges, installation guidance, component overview and release documentation.
- ce71c23: Load Tailwind CSS and Nuxt UI styles in Storybook visual regression snapshots.

## 0.1.0

### Minor Changes

- 201f5dc: Initial public release of Query Kit Nuxt UI table controls.

### Patch Changes

- a38da11: Make documentation screenshot checks resilient to minor cross-platform rendering differences.
- fcdd230: Align GitHub Actions workflows with the Querry Kit package standard.
- 1803c48: Improve table shortcut handling, public API documentation, visual regression coverage and quality gates.
- 6633962: Add npm discovery keywords for Nuxt UI table controls.
- 17cc890: Add GitHub funding metadata.
- 8ae16e9: Generate and validate visual documentation screenshots locally through a conditional Husky hook.
- 0b40c81: Build runtime component files before creating an npm package tarball.
- ec5f4fe: Improve the package README with status badges, usage guidance and release documentation.
- 4194380: Align the Query Kit Nuxt peer dependency with the published 0.0.2 release.
- 06f1525: Format visual regression test configuration.
- d9bb5c3: Add the MIT license text referenced by the package metadata and README.
- 6f50a6c: Run visual regression checks only in the documentation workflow.
- 43e97df: Record the supported pnpm package manager version.
- 657d986: Improve the documentation landing page and navigation for table controls and API reference.
