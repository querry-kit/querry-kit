FROM node:26.13.1-bookworm AS build
WORKDIR /workboard
RUN npm install --global pnpm@11.28.9
COPY . .
# Package sources come from the versioned Git pins, not the npm registry or host checkouts.
RUN node scripts/stage-querry-kit.mjs && CI=true pnpm install --frozen-lockfile
RUN pnpm sources:build && pnpm --filter @workboard/contracts build
RUN pnpm --filter @workboard/api build

FROM node:26.13.1-bookworm-slim AS runtime
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3101
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
# Preserve the frozen install's relative workspace links without resolving peers again.
COPY --from=build --chown=node:node /workboard/node_modules/ /workboard/node_modules/
COPY --from=build --chown=node:node /workboard/vendor/nest/ /workboard/vendor/nest/
COPY --from=build --chown=node:node /workboard/libs/contracts/ /workboard/libs/contracts/
COPY --from=build --chown=node:node /workboard/apps/api/ /workboard/apps/api/
WORKDIR /workboard/apps/api
USER node
EXPOSE 3101
# Migrate before listening; Nest then finishes the empty-database seed before readiness.
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && exec node dist/main.js"]
