# Security Policy

## Supported versions

Only the latest published release of `@querry-kit/nuxt-ui` is supported with security updates.

## Reporting a vulnerability

Please do not report vulnerabilities in public issues. Use [GitHub's private vulnerability reporting](https://github.com/querry-kit/nuxt-ui/security/advisories/new) and include a description, reproduction steps, and potential impact.

We will investigate the report and coordinate a fix before public disclosure.

## Dependency security

Security overrides and audited patches for transitive tooling dependencies are maintained in `pnpm-workspace.yaml` and `patches/`. Validate dependency maintenance with `pnpm audit` and the repository's Dependabot alerts.
