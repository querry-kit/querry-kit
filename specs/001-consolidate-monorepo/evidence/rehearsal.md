# T028 — Release rehearsal

Candidate `ba99528565a66826953c1687fbcca72bf28286dc`. Three disposable Git repositories, no npm publication or remote tag writes. Real Changesets versioning, lockfile refresh and package packing. Simulated registry responses exercise the production candidate checks. Each cell lists the candidate archive integrity.

## UI only

- `@querry-kit/nuxt-ui@4.3.1`: `sha512-/c+ujlmS/pGJbatejI33LbS54AZjQVsnNlyqZ7RqZYtkGRzMZ00x7YxPFAfNbLdycgEpFACo5lAkJBRgZtWbJQ==`

## Nest and UI

- `@querry-kit/nest@2.1.3`: `sha512-onTt2qO2ly2optMpJuC8HHU2IlUcMD/EfZqboeXbqe6ShSWF/hwdIdHznrq9G0vkTQXXbUYECxs6LUAlsgCe8w==`
- `@querry-kit/nuxt-ui@4.3.1`: `sha512-/c+ujlmS/pGJbatejI33LbS54AZjQVsnNlyqZ7RqZYtkGRzMZ00x7YxPFAfNbLdycgEpFACo5lAkJBRgZtWbJQ==`

## Docs only

No version, tarball or tag candidate. A historical private-site entry was rejected; an empty documentation entry selected no libraries.

Same-SHA retry: matching Nest bytes and provenance were classified complete; only missing UI was eligible. Wrong path/name, unexpected extra public manifest, mismatched bytes, wrong provenance commit and registry failure were rejected. No package version or tag was changed in the working repository.
