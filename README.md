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

Cloud Run ficou bloqueado neste ambiente (`BILLING_DISABLED` / Artifact Registry).

Enquanto isso:

```bash
pnpm dev:api
```

E no build do web (quando houver URL):

```bash
VITE_API_BASE=https://SUA-API.run.app pnpm build:web
```

Firebase Auth Settings → Authorized domains: adicionar `memora.hipercube.ia.br` e `memora-1f1.pages.dev`.
