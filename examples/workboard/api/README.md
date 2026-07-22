# Workboard API

Die API modelliert `Workspace → Project → Task`. Mitglieder gehören zu einem
Workspace, Labels stehen in einer n:m-Beziehung zu Aufgaben.
Die Struktur folgt dem Modul-, Prisma- und Konfigurationsaufbau der
Machine-Admin-API, verwendet aber ein eigenständiges Workboard-Datenmodell.

```sh
cp .env.example .env
docker compose up -d
pnpm prisma:generate
pnpm db:push
pnpm db:seed
pnpm dev
```

Die API läuft auf `http://localhost:3101`, Swagger auf `/docs`. Das Prisma-Schema
liegt in `prisma/schema.prisma`, der generierte Client in `src/generated/prisma`.

```sh
curl -g 'http://localhost:3101/api/v1/projects?fields=items{id,name,workspace{name},tasks{title,status,labels{name}}},meta{page,itemCount,pageCount}'
```
