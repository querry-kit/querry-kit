# Workboard API <!-- omit in toc -->

A NestJS API for the Workboard reference application. It models `Workspace` → `Project` → `Task`; members belong to a workspace, and labels have a many-to-many relation with tasks.

See the [Querry Kit overview](../../../README.md) for the complete API-and-web application setup.

## 📚 Table of Contents <!-- omit in toc -->

- [🚀 Run](#-run)
- [🧩 Usage](#-usage)
- [📖 Documentation](#-documentation)

## 🚀 Run

```sh
cp .env.example .env
docker compose up -d
pnpm prisma:generate
pnpm db:push
pnpm db:seed
pnpm dev
```

## 🧩 Usage

The application follows the `config`, Prisma, and domain-module structure of the Machine Admin API while using an independent Workboard data model. The Prisma schema is in `prisma/schema.prisma`, and the generated client is in `src/generated/prisma`.

```sh
curl -g 'http://localhost:3101/api/v1/projects?fields=items{id,name,workspace{name},tasks{title,status,labels{name}}},meta{page,itemCount,pageCount}'
```

## 📖 Documentation

The API runs at `http://localhost:3101`; its OpenAPI documentation is available at `http://localhost:3101/docs`.
