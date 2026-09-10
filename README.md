# Memora

Sua memória pessoal inteligente. Converse com a sua história.

## URLs

- GitHub: https://github.com/klausterra/memora
- App: https://memora.hipercube.ia.br
- Pages: https://memora-1f1.pages.dev

## Stack do MVP

- `apps/web` — Vite + React + Firebase Auth (`hipercube-dev-train`)
- `apps/api` — Fastify + SQLite + chat SSE
- `packages/shared` — tipos e admins

Admins: `klausqterra@gmail.com`, `wanieleterra@gmail.com`

## Local

```bash
pnpm install
pnpm --filter @memora/shared build
pnpm dev
```

- Web: http://localhost:5173
- API: http://localhost:8787

Copie `apps/api/.env.example` → `apps/api/.env`.

Opcional: `OPENAI_API_KEY` para respostas reais (sem chave usa stub).

## Firebase

Projeto: **hipercube-dev-train**

Autorize no console Firebase → Authentication → Settings → Authorized domains:

- `localhost`
- `memora.hipercube.ia.br`
- `memora-1f1.pages.dev`

## Deploy web (Pages)

```bash
pnpm build:web
npx wrangler pages deploy apps/web/dist --project-name memora
```

Build no Git: `pnpm build:web`, output `apps/web/dist`.

## API em produção

Cloud Run (projeto `hipercube-500101`, região `us-central1`):

- URL: https://memora-api-m4vzgfiooa-uc.a.run.app
- Health: `/health`
- Banco: **Cloud SQL Postgres** `memora-pg` (socket `/cloudsql/hipercube-500101:us-central1:memora-pg`)
- Segredo: `memora-database-url` (Secret Manager) → env `DATABASE_URL`

```bash
gcloud run deploy memora-api \
  --project=hipercube-500101 \
  --region=us-central1 \
  --source=. \
  --allow-unauthenticated \
  --set-cloudsql-instances=hipercube-500101:us-central1:memora-pg \
  --env-vars-file=apps/api/cloudrun.env.yaml \
  --update-secrets=DATABASE_URL=memora-database-url:latest
```

Local: sem `DATABASE_URL` → SQLite em `DATABASE_PATH` (padrão `./data/memora.sqlite`).

Web em produção aponta para a API via `VITE_API_BASE` no build:

```bash
VITE_API_BASE=https://memora-api-m4vzgfiooa-uc.a.run.app pnpm build:web
npx wrangler pages deploy apps/web/dist --project-name memora
```

Firebase Auth Settings → Authorized domains: adicionar `memora.hipercube.ia.br` e `memora-1f1.pages.dev`.
