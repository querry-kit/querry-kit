# @querry-kit/landing-page

## 0.2.2

### Patch Changes

- 63b051f: Explicitly prerender the homepage alongside documentation routes so GitHub Pages serves a real index.html at the site root. Verify the generated static entrypoints in CI before uploading the Pages artifact.

## 0.2.1

### Patch Changes

- f90b488: Align the dependency graph with the newly published VueUse-compatible Querry libraries. Scope legacy documentation-tool security overrides to their actual parent packages so modern application peers retain supported versions.

## 0.2.0

### Minor Changes

- 3211273: Update stable documentation and example dependencies, move development and site builds to Node.js 26 LTS, and track site releases with Changesets.

  Refresh compatible transitive security fixes without forcing incompatible Minimatch or Glob major versions into their upstream consumers.

  Install Chromium explicitly for documentation browser checks in fresh CI runners.
