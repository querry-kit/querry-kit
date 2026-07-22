# Workboard Web

Das Nuxt-Frontend verwendet `@querry-kit/nuxt` für den typisierten API-Client
und die tabellenunabhängige State-Logik. `@querry-kit/nuxt-ui` liefert Toolbar,
Filter-, Sortier- und Pagination-Komponenten; Nuxt UI rendert die Tabelle.

```sh
pnpm --filter @querry-kit/example-workboard-api dev
pnpm --filter @querry-kit/example-workboard-web dev
```

Zum Einsatz gegen eine andere API: `NUXT_PUBLIC_API_BASE=https://…` setzen.
