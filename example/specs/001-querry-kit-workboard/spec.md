# Feature Specification: Querry Kit Workboard

**Feature Branch**: `1-build-the-querry-kit-workboard-example-monorepo` | **Issue**: [#1](https://github.com/querry-kit/example/issues/1)

**Created**: 2026-11-19

**Status**: Draft

**Input**: Build a standalone reference monorepo for Querry Kit's read/query capabilities that developers can learn from, adapt as a project template, and use to develop the three packages together.

## User Scenarios & Testing

### User Story 1 - Explore relational tasks (Priority: P1)

Visitors start a seeded demo from the example checkout and use its dashboard to explore tasks, their projects, owners and labels.

**Why this priority**: The demo must be usable without setup in the package repositories.

**Independent Test**: Start the test stack with an empty volume. Switch to `user1` in the navbar, open the tasks view, look up a project, combine filters and sorts, configure columns, page through the results and open a detail view.

**Acceptance Scenarios**:

1. **Given** an empty volume, **when** the stack starts, **then** example accounts and a deterministic relational dataset are ready without a manual seed command.
2. **Given** existing data, **when** the stack restarts, **then** all existing data is preserved and no fixtures are appended.
3. **Given** a filtered and sorted list, **when** the visitor changes pages or opens a detail view, **then** the visible records and fields match the filters, sort order and access rules.

### User Story 2 - Compare access rules (Priority: P1)

Visitors switch between `user1`, `user2` and `admin` without entering a password. The two users have the same role and see different owned records; `admin` sees all records and additional fields.

**Why this priority**: Access enforcement must be observable across the same query interface used by the dashboard.

**Independent Test**: Query the same list, detail, lookup and group views under both accounts and verify exact expected results from the fixtures.

**Acceptance Scenarios**:

1. **Given** an admin view, **when** the visitor selects `user1`, **then** the active account changes without a password and previous admin responses or selections cannot reappear.
2. **Given** `user1` and `user2` share the same role, **when** switching between them or requesting each other's records directly, **then** their owned rows stay isolated and both accounts are denied admin-only fields.

### User Story 3 - Compare grouping and reported totals (Priority: P2)

Visitors group matching tasks by one or two ordered keys, expand branches and optionally display numeric summaries.

**Why this priority**: The example demonstrates grouping separately from aggregate metrics and from client-side grouping of the current page.

**Independent Test**: Group by status, then priority, expand a branch, load more results and add aggregated effort metrics.

**Acceptance Scenarios**:

1. **Given** filtered records, **when** grouping is enabled without optional metrics, **then** each group shows its key and total matching count without additional aggregate columns.
2. **Given** grouped records, **when** optional metrics are enabled, **then** the metrics reflect all matching authorized records in each group, not only loaded records.
3. **Given** a grouped branch, **when** expanded or paginated, **then** it loads the appropriate child groups or records without disturbing unrelated branches.

### User Story 4 - Develop against local packages (Priority: P2)

Maintainers run the database in a container and develop both apps against the three local Querry Kit checkouts.

**Why this priority**: The example must exercise changes that are not published.

**Independent Test**: Make a temporary observable package change in an isolated checkout for each package, rebuild or watch, verify that the app picks it up without downloading Querry Kit packages from a registry, then remove the temporary change.

**Acceptance Scenarios**:

1. **Given** the three local checkouts, **when** a package is rebuilt, **then** its consumers see the change through the documented development workflow.
2. **Given** only the example checkout, **when** a visitor builds the test stack, **then** it builds the pinned package sources without the developer's checkout paths.

### User Story 5 - Adopt Querry Kit in another application (Priority: P2)

Developers can trace one working read request from shared validation through the API to the UI, then adapt the same pattern in their own application or start from a copy of the example.

**Why this priority**: The code and docs are teaching material, not just a feature showcase.

**Independent Test**: From a fresh copy, follow the adaptation guide to add a public task field to the contract, Prisma model and UI; run the documented checks without changing an upstream checkout.

**Acceptance Scenarios**:

1. **Given** a developer unfamiliar with Querry Kit, **when** following the README walkthrough, **then** they can locate each relevant code block and the corresponding upstream documentation.
2. **Given** a copied workspace, **when** the developer follows the template guide, **then** they can adapt the domain and independently identify the demo-only auth, seed and configuration that must be replaced before real deployment.

### Edge Cases

- Invalid fields, operators, group keys, aggregates and pagination fail with documented validation errors.
- Direct requests for rows unavailable to the active account do not confirm their existence.
- Empty results, absent optional assignees, equal sort keys, failed group fetches and rapid account switches have deterministic behavior.
- Failed initial seeding leaves no partial dataset and prevents readiness until initialization succeeds.

## Requirements

### Functional Requirements

- **FR-001**: Provide a dashboard inspired by the CRM shell, with project and task lists, task details, and grouping. The admin can maintain projects and all tasks. Regular accounts can maintain their own tasks in visible projects. Deletion requires confirmation, and projects with tasks cannot be deleted.
- **FR-002**: Demonstrate 1:1, 1:n and m:n relationships with connected fixtures and selectable related fields.
- **FR-003**: Offer exactly three demo logins (`user1`, `user2`, `admin`), default new browser sessions to `admin`, and provide account switching in the navbar. `user1` and `user2` share the same role; row ownership is determined by the active account ID.
- **FR-004**: Enforce different row visibility and field visibility on the server, including derived results and relation lookups.
- **FR-005**: Demonstrate search/autocomplete, scalar and relation filters, multi-sort, column selection and server pagination.
- **FR-006**: Demonstrate server grouping with optional aggregations, ordered levels, branch expansion and more results.
- **FR-007**: Use one shared validation source across the server and browser and document the public read contracts.
- **FR-008**: Initialize deterministic sample data automatically only when the application database is empty; repeat starts must be no-ops for data.
- **FR-009**: Provide two Compose entry points: database only for local development, and database/API/app for trying the example from a single checkout.
- **FR-010**: Consume the three local source packages during development and pinned source revisions in the test stack; do not install the three Querry Kit packages from npm in either path.
- **FR-011**: Map each documented read/query capability to a UI demo or runnable API example; internal helpers, alternate validation stacks, framework variants and domain writes do not require parallel demos.
- **FR-012**: Prioritize readable, consistently formatted source. Add developer-facing comments above key Querry Kit integration blocks explaining what they do, why they are needed, and which parts the example owns. Link directly to the relevant upstream documentation pages in those comments.
- **FR-013**: Provide a README walkthrough and a practical template adaptation guide for copying the workspace or transferring the integration into an existing app. Clearly distinguish reusable code from demo-only code.

### Key Entities

- **Account and Profile**: Demo identity and its one-to-one presentation data.
- **Project and Task**: One project has many tasks; an account may own multiple items.
- **Label**: A task may have multiple labels, and a label may be used by multiple items.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A fresh example checkout and one documented Compose invocation produce a ready, seeded stack; a second start leaves fixture IDs and counts unchanged.
- **SC-002**: The demo account switch changes access with one selection; test fixtures prove exact row counts and field presence for all three accounts, including same-role cross-account denial.
- **SC-003**: Group counts and enabled metrics match independent fixture totals for all three accounts with filtering and at least two ordered grouping levels.
- **SC-004**: The verification matrix has evidence for every in-scope capability and each of the three local packages, including zero registry resolutions for `@querry-kit/*`.
- **SC-005**: A reviewer follows the template guide in a disposable copy, adds one public field end to end, and passes the documented checks. Every key Querry Kit integration block has a useful comment and a direct upstream docs link.

## Assumptions

- Local demo only, with synthetic data. Passwordless persona selection is not production authentication or a protection against a person deliberately selecting `admin`.
- English-only UI for the first version. The CRM is a visual reference, not a runtime or build dependency.
- Development assumes access to compatible package checkouts. The standalone test build requires network access to source and third-party dependency hosts.
