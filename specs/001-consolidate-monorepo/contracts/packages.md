# Public package contract

Compare a candidate pack against the npm tarball, not the repository root. Baselines observed 2026-11-22 (`latest` only); refresh at freeze. All three have MIT licenses and public Node engine `>=26.13.0`, distinct from the private workspace engine ceiling.

| Package | Baseline | Required external-consumer checks |
| --- | --- | --- |
| `@querry-kit/nest` | `2.1.2`, 113 files, 11 entrypoints | Resolve all advertised targets with ESM/CJS and declarations. Preserve optional CASL, Zod, `class-validator` and `class-transformer` peer metadata. Run core and Zod subpath checks without the optional validation peers. |
| `@querry-kit/nuxt` | `1.1.2`, 63 files | ESM/CJS and type resolution for `.`, `/api`, `/table`, `/autocomplete`, `/types`, `/utils`, respecting type-only exports. Preserve `sideEffects: false`; register module in an external Nuxt app. |
| `@querry-kit/nuxt-ui` | `4.3.0`, 128 files | Preserve ESM module and `/types` contract, no new CJS promise. Keep public Nuxt peer `^0.2.0 \|\| ^1.0.0`. Register the packed module with published `@querry-kit/nuxt` `0.2.10` and `1.0.0`, each against matched VueUse core/router `14.4.0` and `15.0.0`. |

Verify name/version, exports and every target, module formats, declarations, runtime and peer dependencies, optional flags, engines, license text, README, file set and required assets. Resolve conditions separately for runtime and type-only usage. Compare published integrity against the baseline download; rebuilt archives are not assumed byte-identical. Reject omissions or unexplained differences. Packed dependency metadata must not require `workspace:`, `file:`, `link:` or Git checkout. Build-time overrides and private dependency links must not narrow a supported consumer range.
