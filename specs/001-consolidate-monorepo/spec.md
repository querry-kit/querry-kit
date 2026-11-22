# Feature Specification: Consolidate Querry Kit

**Issue:** [#53](https://github.com/querry-kit/querry-kit/issues/53) · **Created:** 2026-11-22 · **Status:** Planned

**Input:** [Issue #53](https://github.com/querry-kit/querry-kit/issues/53)

## User Scenarios & Testing

### User Story 1 — Review a change in context (P1)

A contributor changes a library, demonstrates the result in Workboard and updates the guide in one review. Today this requires synchronized checkouts.

**Independent test:** Given a fresh clone and no adjacent source repositories, when a reviewer opens a change spanning the three surfaces, they can build and exercise all three from that revision. Given the old embedded example, when its path changes, each unique teaching case still has a working destination.

### User Story 2 — Keep using a released package (P1)

A package consumer can update normally without changing imports, installing the other libraries unnecessarily, or adopting an unreleased dependency.

**Independent test:** Given each of the three previously released libraries, when its replacement artifact is installed in a separate consumer with supported peers, the existing imports, declarations and registration work. Given a reader following the public site, when a demo needs an unreleased change, its status is explicit.

### User Story 3 — Release only what changed (P2)

A maintainer can release one or more libraries independently and continue publishing site-only updates.

**Independent test:** Given one-library, two-library and docs-only changes, a rehearsal selects exactly one, two and zero packages respectively. Given an interrupted release, the maintainer can identify what succeeded and resume only the missing publications.

### Edge Cases

- Two different examples share a name. No existing database or volume is implicitly reused, reset or combined.
- A release, change request or source commit lands during migration. Reconcile it once before switching ownership.
- If a package owner is unavailable or an artifact changes unexpectedly, the current publisher remains authoritative until the discrepancy is resolved.

## Requirements

### Functional Requirements

- **FR-001:** Import all four source repositories before adapting any code or configuration. Preserve every commit reachable from their frozen refs under its original ID, including side branches, tags and available PR history. Preserve the destination repository, public site address, attribution, licenses, release records and a destination for outstanding work.
- **FR-002:** A contributor must be able to install, build and review the libraries, canonical Workboard and docs from one clone and one dependency lock.
- **FR-003:** Preserve exactly three public package identities, version histories, supported peers, optional integrations and public files. The move itself requires no consumer action.
- **FR-004:** Preserve the canonical example's standalone and development experiences, unique teaching cases from the embedded example, and independent ownership of example data.
- **FR-005:** Preserve documentation links, changelogs and interactive examples on desktop and mobile. Distinguish released behavior from previews.
- **FR-006:** Check affected downstream consumers on each change and the full compatibility set for shared infrastructure changes. Verify the artifacts consumers actually install.
- **FR-007:** Keep release decisions independent. A docs-only change must not publish or tag an npm package. Each public package has at most one active publishing path throughout the switch.
- **FR-008:** Record baseline, handoff, recovery and verification evidence before retiring old repositories. Preserve access to historical records.

### Key Entities

Source snapshot, public package, private consumer, teaching case, release candidate, publishing owner and site deployment. Their relationships and lifecycle are in [the data model](data-model.md).

## Success Criteria

- **SC-001:** One review and one clean checkout suffice to exercise a library change in both consumer surfaces.
- **SC-002:** All three installable packages pass independent compatibility checks; zero undocumented consumer-facing differences.
- **SC-003:** Both Workboard modes run with isolated data; every inventoried teaching case and inbound link has a verified disposition.
- **SC-004:** The existing site serves deep links, changelogs and working mobile and desktop demos; readers can identify features unavailable in the current release.
- **SC-005:** Three release rehearsals select exactly their intended packages; the first legitimate release leaves unrelated versions and distribution tags unchanged.
- **SC-006:** Before any adaptation, a fresh monorepo clone contains zero missing commits from each of the four frozen inventories in the ancestry of `main`; all four imported source trees match exactly. All five repository snapshots have a recorded disposition.

## Assumptions

Maintainers can obtain source, repository administration and package-owner evidence at the freeze. Approving a migration design does not schedule publication, archival or data movement. Feature development, dependency upgrades and database consolidation are outside this change.
