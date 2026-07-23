# Docs app guidelines

## Vue and TypeScript

- Name all new files in `kebab-case` (except convention-required files such as `AGENTS.md`).
- Keep Vue single-file components in `template`, then `script`, then `style` order.
- Explicitly type reactive state and derived values. Use generics for `ref`, `computed`, `useState`, `useAsyncData`, and similar composables.
- Prefer the public or generated types supplied by Nuxt, Nuxt Content, Nuxt UI, and Querry Kit packages. Do not introduce `any` for page data or component state.
- Keep template expressions small; derive non-trivial values in the typed script block.

## UI and documentation

- Prefer native Nuxt UI components before custom markup or custom controls.
- Keep the header, package navigation, sidebar, table of contents, and mobile navigation consistent with the Nuxt UI docs experience.
- Use Nuxt Content collections and typed content items for documentation pages.

## Validation

- Run `pnpm docs:lint` and `pnpm docs:typecheck` after code changes.
- Run `pnpm docs:test` for changes affecting documentation UI, navigation, themes, search, or interactive demos.
