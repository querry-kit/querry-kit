# Contributing

Workboard is a local reference app for Querry Kit. Use an
[issue](https://github.com/querry-kit/example/issues) to report a reproducible bug
or discuss a larger change. Send security reports through the
[security policy](SECURITY.md).

## Set up the workspace

Follow the [README](README.md#bootstrap) to install the pinned Node.js and pnpm
versions, stage the upstream sources, and build the workspace. Use Docker Compose
for the [local PostgreSQL database](README.md#start-the-api-locally) or to run the
[standalone demo](README.md#try-the-standalone-demo). Keep the passwordless demo
and its synthetic fixtures on a local machine.

## Open a pull request

1. Create a branch from `main` on your fork or in this repository if you have write access. Link the issue if one exists.
2. Follow the [coding guidelines](docs/coding-guidelines.md) and add regression coverage where behavior changes.
3. Run the [verification commands](README.md#verify-changes) relevant to your change. CI also checks the build, types,
   pinned sources, API integration tests, and standalone Compose browser flows.
4. Open a pull request against `main`. Describe the change, how you verified it, and any checks you could not run.
