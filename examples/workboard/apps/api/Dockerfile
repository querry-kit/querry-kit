FROM node:26.13.1-bookworm AS build
WORKDIR /repo
RUN npm install --global pnpm@11.28.9
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches/ patches/
COPY packages/nest/ packages/nest/
COPY packages/nuxt/ packages/nuxt/
COPY packages/nuxt-ui/ packages/nuxt-ui/
COPY examples/workboard/libs/contracts/ examples/workboard/libs/contracts/
COPY examples/workboard/apps/api/ examples/workboard/apps/api/
RUN CI=true pnpm --filter @workboard/api... install --frozen-lockfile
RUN pnpm --filter @querry-kit/nest build
RUN pnpm --filter @workboard/contracts build && pnpm --filter @workboard/api build
RUN pnpm --filter @workboard/api deploy --legacy --prod /runtime

FROM node:26.13.1-bookworm-slim AS runtime
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3101
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build --chown=node:node /runtime/ /workboard/api/
WORKDIR /workboard/api
USER node
EXPOSE 3101
# Migrate before listening; Nest then finishes the empty-database seed before readiness.
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && exec node dist/main.js"]
