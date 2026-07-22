# Querry Kit

Querry Kit ist eine Sammlung zusammenpassender Bausteine für relationale,
typsichere NestJS-APIs und Nuxt-Oberflächen. Dieses Repository ist der Einstieg
in das Projekt und enthält eine vollständige, lokal ausführbare Referenzanwendung.

## Die drei Kern-Repositories

| Repository                                                     | Aufgabe in den Beispielen                                                                                                      |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [`@querry-kit/nest`](https://github.com/querry-kit/nest)       | NestJS-Controller-Helfer, `ResourceQuery`, DTO-basierte `fields`-Projektionen, Pagination, Query-Pipes und Swagger-Dekoratoren |
| [`@querry-kit/nuxt`](https://github.com/querry-kit/nuxt)       | Axios-Client, typisierte Resource-Clients und die headless Tabellen-Composable `useTable`                                      |
| [`@querry-kit/nuxt-ui`](https://github.com/querry-kit/nuxt-ui) | Nuxt-Modul mit Toolbar, Filtern, Sortierung, Spaltenoptionen und Pagination für Query-Kit-Tabellen                             |

## Referenzanwendung: Workboard

Ein Arbeitsbereich für Produktteams. Das Datenmodell verbindet:

- `Workspace` → `Project` → `Task` (zwei 1:n-Relationen)
- `Workspace` → `Member` (1:n)
- `Task` ↔ `Label` (n:m)

Die Nest-API folgt einer produktionsnahen Struktur mit `config`, `prisma` und
domänenspezifischen `modules`. Sie verwendet das eigene Prisma-Modell aus
`examples/workboard/api/prisma/schema.prisma`; die Nuxt-App lädt die
Projektliste mit `useTable` und bindet `QuerryKitTableToolbar` sowie
`QuerryKitTablePagination` ein.

## Schnellstart

Voraussetzung: Node.js 24 und pnpm 11. Die drei Kern-Repositories müssen als
Geschwisterverzeichnisse neben diesem Checkout vorhanden sein (wie in der
Querry-Kit-Organisation). Die Beispielpakete verwenden bewusst `link:`-Specs,
damit jede Änderung an den Bibliotheken unmittelbar in den Referenzapps landet.

```sh
pnpm install

cd examples/workboard/api
cp .env.example .env
docker compose up -d
pnpm prisma:generate && pnpm db:push && pnpm db:seed

# Terminal 1 und 2: API und Web
pnpm --filter @querry-kit/example-workboard-api dev
pnpm --filter @querry-kit/example-workboard-web dev
```

| Anwendung | API                     | Web                     | Swagger                      |
| --------- | ----------------------- | ----------------------- | ---------------------------- |
| Workboard | `http://localhost:3101` | `http://localhost:3201` | `http://localhost:3101/docs` |

Für eine getrennt bereitgestellte API setzt das jeweilige Web-Paket
`NUXT_PUBLIC_API_BASE=https://api.example.test`.

## Validierung

```sh
pnpm docs:build
pnpm examples:check
pnpm examples:build
```

Für die lokale Datenbank bringt das Beispiel einen PostgreSQL-Compose-Service,
ein Prisma-Schema und einen idempotenten Seed mit.

## Website

Die VitePress-Übersicht wird nach GitHub Pages veröffentlicht:

- Website: <https://querry-kit.github.io/querry-kit/>
- Organisation: <https://github.com/querry-kit>
