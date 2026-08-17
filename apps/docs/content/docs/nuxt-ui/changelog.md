# @querry-kit/nuxt-ui

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
