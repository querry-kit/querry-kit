# Data Model: Querry Kit Workboard

| Entity | Fields and constraints | Relationships |
| --- | --- | --- |
| Account | Stable ID, unique login (`user1`, `user2`, `admin`), role (`user` or `admin`) | One profile; owns many tasks |
| Profile | Unique account FK, display name | Exactly one seeded profile per account (1:1) |
| Project | Stable ID, unique slug, title | One project has many tasks (1:n) |
| Task | Stable ID, project FK, owner FK, optional assignee FK, title, status enum, priority enum, nonnegative integer `estimatedHours`, admin-only `internalNote` and nonnegative `internalCostCents`, creation timestamp | One project; one owner; optional assignee; many labels |
| Label | Stable ID, unique slug, display name | Many tasks (m:n) via join table with unique item/label pairs |

Use indexes on owner/project identifiers and on query paths where the reviewed migration and fixtures justify them. Use existing PostgreSQL/Prisma relationship constraints for referential integrity; no mutation workflow or public raw database arguments.

## Canonical schema field names

- `Account`: `id`, `login`, `role`.
- `Profile`: `accountId`, `displayName`.
- `Project`: `id`, `slug`, `title`.
- `Task`: `id`, `projectId`, `ownerId`, `assigneeId`, `title`, `status`, `priority`, `estimatedHours`, `internalNote`, `internalCostCents`, `createdAt`.
- `Label`: `id`, `slug`, `displayName`.
- `TaskLabel`: `taskId`, `labelId`; both are foreign keys and the pair is unique.

## Fixtures and visibility

- Each of `user1`, `user2`, and `admin` owns six items. Both users have items in a shared project and distinct projects; reserve one additional project for admin-owned items only. Reuse at least one label across owners, and give each owner an exclusive label. This makes same-role differences visible both within one relation and in scoped lookups.
- Include at least three statuses, multiple priorities within a status, duplicate public sort values and a null assignee. Put a rare status and a distinctive internal cost on admin-only rows to make negative count/group/metric assertions meaningful.
- Fix fixture IDs and expected results as an independently declared test oracle. `OPEN` estimates: `user1` owns 2 and 6 hours (count 2, sum 8, avg 4, min 2, max 6); `user2` owns 3 and 9 hours (count 2, sum 12, avg 6, min 3, max 9); `admin` owns one additional item at 10 hours and sees all five (sum 30, avg 6, min 2, max 10). No expected result is calculated by invoking the query implementation.
- For the `user` role, projects/labels are accessible only if they relate to an item owned by the active account; nested reads and lookup queries must not broaden that set. Profiles expose only public display data through allowed item relations. No inverse collection traversal is exposed from the browser.

## Initialization

The API owns migrations and seed. After migration, lock the seed transaction, confirm all application tables are empty, insert relations in FK order, and commit before readiness. Exclude Prisma bookkeeping tables from emptiness checks. If any application data exists, leave it untouched. Incomplete custom data is not silently repaired; if a demo account is unavailable, return a documented setup error on selection. No production or shared-database operations belong to this demo.
