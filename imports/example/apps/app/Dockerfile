FROM node:26.13.1-bookworm AS build
WORKDIR /workboard
RUN npm install --global pnpm@11.28.9
COPY . .
# Match the API build's staging and lockfile so both images consume the same Querry Kit revisions.
RUN node scripts/stage-querry-kit.mjs && CI=true pnpm install --frozen-lockfile
RUN pnpm sources:build && pnpm --filter @workboard/contracts build
RUN pnpm --filter @workboard/app build

FROM node:26.13.1-bookworm-slim AS runtime
WORKDIR /opt/workboard
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3201
COPY --from=build --chown=node:node /workboard/apps/app/.output/ ./
USER node
EXPOSE 3201
CMD ["node", "server/index.mjs"]
