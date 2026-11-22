FROM node:26.13.1-bookworm AS build
WORKDIR /repo
RUN npm install --global pnpm@11.28.9
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches/ patches/
COPY packages/nest/ packages/nest/
COPY packages/nuxt/ packages/nuxt/
COPY packages/nuxt-ui/ packages/nuxt-ui/
COPY example/libs/contracts/ example/libs/contracts/
COPY example/apps/web/ example/apps/web/
RUN CI=true pnpm --filter @workboard/app... install --frozen-lockfile
RUN pnpm --filter @querry-kit/nuxt build
RUN pnpm --filter @querry-kit/nuxt-ui build
RUN pnpm --filter @workboard/contracts build && pnpm --filter @workboard/app build

FROM node:26.13.1-bookworm-slim AS runtime
WORKDIR /opt/workboard
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3201
COPY --from=build --chown=node:node /repo/example/apps/web/.output/ ./
USER node
EXPOSE 3201
CMD ["node", "server/index.mjs"]
