# Coding guidelines

Use Node 26 and the pnpm version in `package.json`. These rules apply to example code, scripts, and tests; exclude generated, vendored, and build output. ESLint, Prettier and TypeScript configuration live in the workspace.

## TypeScript and documentation

- Use two spaces, single quotes, required semicolons, trailing commas where supported, 120 columns, and LF. Keep imports together and separate them from declarations. Avoid `any`; validate external input and narrow `unknown`.
- Use short, descriptive names and keep read behavior visible instead of hiding it behind generic factories.
- Document every handwritten function, method, callback, accessor and composable, plus exported type declarations. Use concise JSDoc/TSDoc to describe purpose and relevant inputs, return values, side effects and errors. Review comment meaning and declarations exported indirectly manually.
- Introduce key Querry Kit blocks with a short explanation of why they exist and what the example owns. Link directly to the matching upstream page using `@see` or an adjacent comment. Do not repeat obvious code.

## Vue single-file components

- Use `<template>`, `<script setup lang="ts">`, then `<style>` where applicable; separate blocks with one blank line. Keep script and style contents unindented. Indent template contents by two spaces per level and put non-inline content on separate lines. Keep inline `span` and preserve significant whitespace.
- Short opening tags may stay on one line. Multiline tags put their closing `>` or `/>` on its own aligned line.
- Order attributes as definition/list/conditional/render directives, identity bindings, two-way bindings, remaining directives, global attributes, static values, dynamic values, events and content bindings. Do not alphabetize within groups. Preserve binding/event precedence and review automatic reordering.
- Prefer typed props, emits and models. Preserve keyboard operation, accessible names, focus, and useful pending and error states.

## Verification

Run commands from the workspace root. Check commands do not change files.

| Command             | Purpose                                                        |
| ------------------- | -------------------------------------------------------------- |
| `pnpm lint`         | ESLint including SFC order and doc-comment checks; no warnings |
| `pnpm lint:fix`     | Apply supported lint fixes, then review behavioral precedence  |
| `pnpm format:check` | Compare against Prettier plus the canonical Vue layout pass    |
| `pnpm format:fix`   | Write the same formatting pipeline used by the check           |
| `pnpm typecheck`    | Check the shared library and both apps after dependency builds |
| `pnpm build`        | Build staged packages, contracts, API and web app              |

When editing formatter or lint rules, verify valid and invalid TS and Vue fixtures and require identical bytes on a second format pass. Vue formatting intentionally applies layout rules after Prettier; plain `prettier --check` does not replace `pnpm format:check`.

For Spec Kit delivery, validate one task, make its own commit, then push it to the linked issue branch before starting the next task. A push does not authorize merging.
