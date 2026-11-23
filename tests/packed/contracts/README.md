# Packed consumer contracts

Review changes to these manifests alongside public API, supported peers, release notes and consumer fixtures. Nest and Nuxt publish dual modules and their CommonJS declarations; their bundler may rename private hashed chunks. UI ships its module metadata, runtime JavaScript, declarations and Vue components. Only documented targets, required runtime assets, companion declarations/maps and the anchored private chunk patterns are accepted. The migration baseline remains independently reproducible with `pnpm verify:packages --historical --archives-only`.
