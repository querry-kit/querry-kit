# Workboard Web <!-- omit in toc -->

A Nuxt frontend for the Workboard reference application. It uses `@querry-kit/nuxt` for its typed API client and headless table state, and `@querry-kit/nuxt-ui` for the toolbar, filtering, sorting, and pagination controls.

See the [Querry Kit overview](../../../README.md) for the complete API-and-web application setup.

## 📚 Table of Contents <!-- omit in toc -->

- [🚀 Run](#-run)
- [🧩 Usage](#-usage)
- [📖 Documentation](#-documentation)

## 🚀 Run

Start the API and web app in separate terminals:

```sh
pnpm --filter @querry-kit/example-workboard-api dev
pnpm --filter @querry-kit/example-workboard-web dev
```

## 🧩 Usage

Nuxt UI renders the table while the Querry Kit packages own the API contract, table state, and table controls. To use a separately deployed API, set `NUXT_PUBLIC_API_BASE=https://api.example.test`.

## 📖 Documentation

The web app runs at `http://localhost:3201`. See the [@querry-kit/nuxt documentation](https://querry-kit.github.io/nuxt/) and [@querry-kit/nuxt-ui documentation](https://querry-kit.github.io/nuxt-ui/) for package guidance.
