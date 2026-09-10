FROM node:22-bookworm-slim
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
RUN pnpm install --frozen-lockfile --filter @memora/api... \
  && pnpm --filter @memora/shared build \
  && pnpm --filter @memora/api build
WORKDIR /app/apps/api
ENV PORT=8080
ENV HOST=0.0.0.0
ENV FIREBASE_PROJECT_ID=hipercube-dev-train
ENV AI_BACKEND=vertex
ENV VERTEX_PROJECT=hipercube-500101
ENV VERTEX_LOCATION=us-central1
ENV VERTEX_MODEL=gemini-2.5-flash
ENV VERTEX_FORCE_ADC=1
EXPOSE 8080
CMD ["node", "dist/server.js"]
