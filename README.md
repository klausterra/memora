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

```bash
gcloud run deploy memora-api \
  --project=hipercube-500101 \
  --region=us-central1 \
  --source=. \
  --allow-unauthenticated \
  --env-vars-file=apps/api/cloudrun.env.yaml
```

Web em produção aponta para a API via `VITE_API_BASE` no build:

```bash
VITE_API_BASE=https://memora-api-m4vzgfiooa-uc.a.run.app pnpm build:web
npx wrangler pages deploy apps/web/dist --project-name memora
```

Nota: SQLite em `/tmp` no Cloud Run é efêmero (reinícios perdem dados). Persistência durável fica para uma próxima onda.

Firebase Auth Settings → Authorized domains: adicionar `memora.hipercube.ia.br` e `memora-1f1.pages.dev`.
