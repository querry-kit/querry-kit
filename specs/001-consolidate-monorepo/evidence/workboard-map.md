# Workboard disposition at freeze

Sources: [embedded API and web](https://github.com/querry-kit/querry-kit/tree/34b2dca/examples/workboard), [canonical Workboard](https://github.com/querry-kit/example/tree/f7f7d0b), [expected fixture and consumer checks](../contracts/consumers.md). These are preservation targets, not completed post-import tests.

| Original teaching case / entry point | Destination after T010 | Acceptance |
| --- | --- | --- |
| `GET /api/v1/projects` with `items{id,name,workspace{name},tasks{title,status,labels{name}}},meta{page,itemCount,pageCount}` | Nest projection fixture and guide; keep a permalink to the original API and web column definitions | Assert the exact selected envelope, `Spring launch` → `Product studio`, two labels on `Refine product brief`, empty labels on `Document API contract`, and absence of unrequested fields. |
| `GET /api/v1/projects/:id`; nullable task assignees and `workspace.members` | Same DTO fixture, not the canonical `/api/projects` bounded lookup | Exercise nullable projection and nested member selection without supplying unrelated fields. |
| `POST /api/v1/projects` and `PATCH /api/v1/projects/tasks/:id` | Document original pre-write selection and post-write mapping alongside a pinned controller link. Canonical writes use their own contracts. | Explain `name/workspaceId`, nullable `assigneeId`, and that the legacy PATCH returns a task rather than the project claimed by its decorator. |
| Root README, embedded API/web READMEs and root example filters | Root and canonical Workboard setup; old schema links go to the fixture or original commit | Fresh clone can follow the instructions without sibling packages. No link claims the canonical API accepts the legacy graph. |
| `apps/docs/content/example.md`, header/home CTA, package badges, Nuxt mock guide | Preserve `/example` as documentation, replace source/staging links, keep historical guide URLs | Test direct reload under `/querry-kit/`, route meaning, source anchors and mobile navigation. |

**Ownership:** The embedded UUID workspace/member/project/task/label schema uses PostgreSQL 17, a named volume and a destructive reset seed. Canonical accounts/profiles/projects/tasks/task-label joins use PostgreSQL 18, distinct demo/dev bind directories and only seed empty application tables. Both dev setups default to port 54329. No dataset, bind mount, port or seed is implicitly shared or migrated.

**Disposition:** No concrete consumer requiring the old executable was identified in the freeze inventory. Keep the embedded path untouched in the import PR. T011 moves it aside; T015/T017 preserve and check teaching material before removing the temporary copy. Any proposed ongoing private legacy app requires a named consumer, separate storage and an exit test.
