# F01 — default-branch verification

[#60](https://github.com/querry-kit/querry-kit/pull/60) merged after the [full CI run](https://github.com/querry-kit/querry-kit/actions/runs/45086518530) at `9a13e362ffd899a97e0e2fac8fd6c75eac1ae354`. The merged `pnpm-lock.yaml` blob is `e8a58e8d18575761b60e85cb5a0dae59e10e5d34`, identical to the audited PR head.

Frozen install and `pnpm -r why brace-expansion` found one 1.x resolution: `serve@14.2.8` → `serve-handler@6.1.7` → `minimatch@3.1.5` → `brace-expansion@1.1.22` (previously `1.1.18`). The installed `5.0.12` line and the 2.x override were unchanged. `pnpm audit --json` reported zero findings at all severities.

GitHub marked Dependabot alerts [79](https://github.com/querry-kit/querry-kit/security/dependabot/79), [80](https://github.com/querry-kit/querry-kit/security/dependabot/80) and [81](https://github.com/querry-kit/querry-kit/security/dependabot/81) `fixed` on 2026-11-23 at 00:26:15 UTC.
