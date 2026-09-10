FROM node:22-bookworm-slim
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY package.json pnpm-workspace.yaml ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
RUN pnpm install --filter @memora/api... \
  && pnpm --filter @memora/shared build \
  && pnpm --filter @memora/api build
WORKDIR /app/apps/api
ENV PORT=8080
ENV HOST=0.0.0.0
ENV DATABASE_PATH=/tmp/memora.sqlite
ENV FIREBASE_PROJECT_ID=hipercube-dev-train
EXPOSE 8080
CMD ["node", "dist/server.js"]
