# Memora — Scaffold do Projeto

## 1. Visão do produto

**Memora** é um SaaS de diário conversacional com inteligência artificial.

A proposta não é ser apenas um diário com IA, mas uma **memória pessoal inteligente** que nasce de conversas naturais.

A experiência central deve ser:

> abrir → escrever ou falar → conversar → fechar

Todo o restante deve acontecer de forma automática.

### Posicionamento

**Memora — sua memória pessoal inteligente.**

Tagline:

**Converse com a sua história.**

---

## 2. Princípios de produto

### Princípio 1
**Nunca peça ao usuário uma informação que a IA possa inferir.**

A IA deve extrair automaticamente:

- pessoas;
- projetos;
- acontecimentos;
- decisões;
- lugares;
- temas;
- sentimentos percebidos;
- objetivos;
- ideias;
- contexto temporal.

### Princípio 2
**Nunca interrompa uma boa história para estruturar dados.**

A estruturação deve acontecer em segundo plano.

### Princípio 3
**Zero página em branco. Zero formulário. Zero sensação de obrigação.**

O usuário deve sempre encontrar uma entrada leve para começar.

### Princípio 4
**A tecnologia desaparece para a história da pessoa aparecer.**

---

## 3. Experiência principal

### Home

A tela inicial não deve parecer um dashboard tradicional.

Exemplo:

```text
                    9 de setembro

                 Boa tarde, Klaus.

           O que vale a pena guardar de hoje?


        ┌──────────────────────────────┐
        │                              │
        │  Comece por onde quiser...   │
        │                              │
        └──────────────────────────────┘

              🎙 Falar   ✦ Me ajude a começar
```

Elementos mínimos:

- data;
- saudação;
- pergunta contextual;
- campo de escrita;
- botão de voz;
- botão de inspiração;
- acesso discreto às memórias;
- perfil.

---

## 4. UX de baixíssimo atrito

O usuário não deve:

- criar tags;
- preencher humor;
- selecionar projeto;
- escolher categoria;
- preencher formulário;
- nomear pessoas;
- classificar sentimentos;
- organizar manualmente o diário.

A IA deve fazer isso silenciosamente.

### Exemplo

Usuário:

> Hoje conversei com o João sobre o Atlas. Acho que estamos errando o posicionamento e talvez seja melhor simplificar.

O sistema pode inferir:

```text
Pessoa: João
Projeto: Atlas
Tema: posicionamento
Possível decisão: simplificar
Data: hoje
```

O usuário nunca precisa preencher isso manualmente.

---

## 5. Conversa

A IA não deve parecer um chatbot genérico.

Ela deve:

- falar pouco;
- fazer no máximo uma pergunta por vez;
- reagir ao conteúdo antes de perguntar;
- evitar interrogatório;
- evitar perguntas repetitivas;
- usar memória anterior apenas quando realmente fizer sentido.

### Exemplo

Usuário:

> Hoje estou meio frustrado com o projeto.

IA:

> Parece que alguma coisa saiu diferente do que você esperava. O que mais pesou hoje?

---

## 6. Quebra-gelo

Nunca começar sempre com:

> Como foi seu dia?

Criar um motor de perguntas contextuais.

### Exemplos

- O que ficou na sua cabeça hoje?
- O que vale a pena guardar de hoje?
- Aconteceu alguma coisa que você gostaria de lembrar daqui a alguns anos?
- Qual foi o momento mais importante do seu dia?
- Alguma coisa te surpreendeu?
- Tem algo que ainda está ocupando sua cabeça?
- Se hoje virasse uma página de um livro, o que estaria nela?
- Estou aqui. Comece por onde quiser.

### Contextual

Se ontem o usuário estava esperando uma resposta:

> Ontem você estava esperando aquela resposta. Aconteceu alguma coisa?

---

## 7. Modos implícitos de conversa

O usuário não precisa necessariamente selecionar um modo.

A IA pode detectar o contexto.

Possíveis comportamentos:

- diário livre;
- reflexão;
- decisão;
- gratidão;
- desabafo;
- ideias;
- planejamento;
- registro de lembrança.

---

## 8. Memória pessoal inteligente

O diferencial do produto é lembrar e conectar.

A IA deve conseguir responder perguntas como:

- Quando comecei a pensar nesse projeto?
- Quando mencionei João pela primeira vez?
- Por que abandonei aquele projeto?
- Quais foram minhas maiores preocupações este ano?
- Quais decisões deram certo?
- Como minha opinião sobre isso mudou?
- O que eu pensava sobre esse assunto seis meses atrás?

### Conceito

**Pergunte à minha vida**

Uma área onde o usuário conversa com sua própria história.

---

## 9. Life Graph

Além de embeddings, o sistema deve construir relações estruturadas.

```text
EU
│
├── Pessoas
│
├── Projetos
│
├── Lugares
│
├── Decisões
│
├── Objetivos
│
├── Ideias
│
├── Momentos
│
└── Fases da vida
```

Exemplo:

```text
Projeto Atlas
   │
   ├── começou em março
   ├── João participou
   ├── decisão X tomada em abril
   ├── problema Y apareceu em maio
   └── encerrado em julho
```

---

## 10. Timeline

Tela:

# Minha história

Mostrar acontecimentos relevantes organizados cronologicamente.

### Setembro de 2026

- começou o Projeto Atlas;
- conversa importante com João;
- decisão de alterar estratégia;
- nova ideia de produto.

A timeline deve ser gerada automaticamente a partir das conversas.

---

## 11. Revisões

### Revisão semanal

Gerar:

- principais acontecimentos;
- temas recorrentes;
- pessoas mencionadas;
- decisões tomadas;
- pendências;
- conquistas;
- algo que ficou em aberto;
- uma pergunta de reflexão.

### Revisão mensal

Gerar:

- principais acontecimentos;
- projetos;
- pessoas;
- decisões;
- mudanças percebidas;
- preocupações recorrentes;
- ideias;
- aprendizados.

### Revisão anual

Criar algo com valor emocional:

# Seu 2027

Possíveis seções:

- capítulos do ano;
- pessoas;
- lugares;
- projetos;
- acontecimentos;
- conquistas;
- decisões;
- fotos;
- frases;
- mudanças de opinião.

Futuro possível:

**Meu livro de 2027**

PDF ou versão impressa.

---

## 12. Design

Direção visual:

**Calm Editorial**

Características:

- visual clean;
- muito espaço negativo;
- tipografia elegante;
- fundo branco levemente quente ou cinza muito claro;
- bordas discretas;
- poucas sombras;
- animações suaves;
- sensação de papel, vidro e luz;
- sem estética futurista;
- sem excesso de gradientes;
- sem dashboards pesados.

A escrita deve dominar a tela.

### Modo foco

Quando o usuário começa a escrever:

- cabeçalho reduz;
- menus desaparecem;
- campo cresce;
- controles perdem destaque;
- texto vira o foco principal.

---

## 13. Navegação

Máximo de quatro áreas principais:

```text
Hoje

Memórias

Perguntar

Você
```

O produto deve revelar complexidade progressivamente.

### Progressive disclosure

Primeiros dias:

```text
Escrever
```

Depois:

```text
Escrever
Memórias
```

Depois:

```text
Escrever
Memórias
Sua semana
```

Mais tarde:

```text
Escrever
Memórias
Timeline
Pergunte à sua história
```

---

# 14. Arquitetura

## Stack

```text
GitHub
   │
   ├── Frontend
   │      ↓
   │ Cloudflare Pages
   │
   └── Backend
          ↓
       Google Cloud
```

### Frontend
- React
- TypeScript
- Next.js ou Vite/React
- TailwindCSS
- shadcn/ui
- PWA
- Cloudflare Pages

### Backend
- Node.js
- TypeScript
- Fastify
- Google Cloud Run

### Autenticação
- Firebase Authentication

### Banco
- Google Cloud SQL
- PostgreSQL
- pgvector

### Arquivos futuros
- Google Cloud Storage

### Secrets
- Google Secret Manager

### Jobs assíncronos
- Google Cloud Tasks

### Observabilidade
- Google Cloud Logging
- Google Cloud Monitoring

---

## 15. Repositório

Sugestão de monorepo:

```text
memora/
│
├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   ├── shared/
│   ├── types/
│   └── ai/
│
├── database/
│   ├── migrations/
│   ├── schema/
│   └── seeds/
│
├── infrastructure/
│   ├── cloudrun/
│   ├── cloudflare/
│   └── github-actions/
│
├── docs/
│   ├── PRODUCT.md
│   ├── ARCHITECTURE.md
│   ├── AI-BEHAVIOR.md
│   └── SECURITY.md
│
├── .github/
│   └── workflows/
│
├── README.md
└── package.json
```

Usar pnpm workspaces.

---

## 16. Firebase Authentication

Firebase será responsável por identidade.

Métodos iniciais:

- Google;
- e-mail/senha;
- magic link.

Posteriormente:

- Apple.

### Fluxo

```text
Usuário faz login
        ↓
Firebase Auth
        ↓
Firebase ID Token
        ↓
Frontend chama API
        ↓
Authorization: Bearer <token>
        ↓
Cloud Run
        ↓
Firebase Admin SDK valida token
```

---

## 17. Identidade interna

Não usar e-mail como chave primária.

Tabela `users`:

```sql
id UUID PRIMARY KEY
firebase_uid VARCHAR UNIQUE NOT NULL
email VARCHAR
name VARCHAR
preferred_name VARCHAR
timezone VARCHAR
created_at TIMESTAMP
updated_at TIMESTAMP
```

---

## 18. API

Prefixo:

```text
/api/v1/
```

Endpoints iniciais:

```text
GET    /health
GET    /me

POST   /chat/sessions
GET    /chat/sessions
GET    /chat/sessions/:id

POST   /chat/sessions/:id/messages
POST   /chat/sessions/:id/finish

GET    /journal
GET    /journal/:id

GET    /timeline

GET    /memories
GET    /memories/search

GET    /insights
GET    /insights/weekly
GET    /insights/monthly
```

---

## 19. Streaming

Usar streaming HTTP ou SSE.

Evitar WebSocket inicialmente.

Fluxo:

```text
Frontend
   ↓
Cloud Run
   ↓
LLM
   ↓
Streaming
   ↓
Frontend
```

---

## 20. Banco de dados

### journal_sessions

```sql
id UUID PRIMARY KEY
user_id UUID
mode VARCHAR
status VARCHAR
started_at TIMESTAMP
ended_at TIMESTAMP
```

### messages

```sql
id UUID PRIMARY KEY
session_id UUID
role VARCHAR
content TEXT
created_at TIMESTAMP
```

### journal_entries

```sql
id UUID PRIMARY KEY
user_id UUID
session_id UUID
title VARCHAR
summary TEXT
content TEXT
entry_date DATE
created_at TIMESTAMP
```

### memories

```sql
id UUID PRIMARY KEY
user_id UUID
memory_type VARCHAR
content TEXT
importance FLOAT
embedding VECTOR
created_at TIMESTAMP
updated_at TIMESTAMP
```

### people

```sql
id UUID PRIMARY KEY
user_id UUID
name VARCHAR
description TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
```

### topics

```sql
id UUID PRIMARY KEY
user_id UUID
name VARCHAR
created_at TIMESTAMP
```

### insights

```sql
id UUID PRIMARY KEY
user_id UUID
type VARCHAR
period_start DATE
period_end DATE
content JSONB
created_at TIMESTAMP
```

### ai_usage

```sql
id UUID PRIMARY KEY
user_id UUID
session_id UUID
provider VARCHAR
model VARCHAR
input_tokens INTEGER
output_tokens INTEGER
estimated_cost NUMERIC
created_at TIMESTAMP
```

---

## 21. AI Layer

Nunca chamar provider diretamente dentro dos controllers.

Estrutura:

```text
Controller
↓
Service
↓
AI Service
↓
AI Provider
```

Diretório:

```text
apps/api/src/modules/ai/
```

Estrutura sugerida:

```text
ai/
│
├── ai.service.ts
├── providers/
│   ├── openai.provider.ts
│   └── provider.interface.ts
│
├── chat/
│   ├── chat.service.ts
│   └── chat.prompt.ts
│
├── memory/
│   ├── memory.service.ts
│   ├── memory.extractor.ts
│   └── memory.retriever.ts
│
├── embeddings/
│   └── embeddings.service.ts
│
├── journal/
│   └── journal-summarizer.ts
│
└── insights/
    └── insights.service.ts
```

Isso permite trocar OpenAI por outro provider futuramente.

---

## 22. Memory Engine

Fluxo:

```text
Nova mensagem
      ↓
Salvar mensagem
      ↓
Buscar contexto recente
      ↓
Gerar embedding
      ↓
Busca vetorial
      ↓
Recuperar memórias relevantes
      ↓
Montar contexto
      ↓
Enviar ao modelo
      ↓
Resposta
```

---

## 23. Context Builder

Nunca enviar todo o diário ao modelo.

Montar:

```text
SYSTEM PROMPT

+

PROFILE

+

RECENT CONTEXT

+

RELEVANT MEMORIES

+

CURRENT SESSION
```

---

## 24. Extração de memória

Usar Structured Output.

Exemplo:

```json
{
  "memories": [
    {
      "type": "project",
      "content": "Usuário iniciou o Projeto Atlas.",
      "importance": 0.82
    }
  ]
}
```

Sugestão:

```text
importance >= 0.65
```

para persistir memória.

Tipos:

```text
person
project
event
decision
preference
goal
idea
context
place
```

---

## 25. Icebreaker Service

Criar:

```text
IcebreakerService
```

Entrada:

```json
{
  "time": "evening",
  "recentTopics": [],
  "lastSession": {},
  "userPreferences": {}
}
```

Saída:

```json
{
  "question": "O que mais ficou na sua cabeça hoje?"
}
```

---

## 26. Pipeline de sessão

Estados:

```text
CREATED
ACTIVE
FINISHING
FINISHED
```

Fluxo:

```text
CREATE SESSION
      ↓
GET ICEBREAKER
      ↓
CHAT
      ↓
FINISH
      ↓
SUMMARIZE
      ↓
EXTRACT MEMORIES
      ↓
CREATE JOURNAL ENTRY
```

---

## 27. Jobs assíncronos

Cloud Run API:

- autenticação;
- chat;
- streaming;
- consultas.

Cloud Run Worker:

- embeddings;
- sumarização;
- extração de memória;
- insights;
- revisão semanal;
- revisão mensal.

Usar Google Cloud Tasks.

---

## 28. Segurança

Cada request:

```text
Firebase Token
        ↓
Firebase Admin SDK
        ↓
uid
        ↓
user interno
        ↓
query filtrada por user_id
```

Regra:

**Nenhum endpoint deve aceitar `user_id` enviado pelo frontend para decidir qual usuário acessar.**

### Secrets

Nunca armazenar no GitHub:

```text
OPENAI_API_KEY
DATABASE_URL
FIREBASE_PRIVATE_KEY
```

Usar Google Secret Manager.

### Logs

Não registrar conteúdo integral do diário.

---

## 29. Cloud SQL

Preferência:

- Cloud SQL Connector;
- conexão privada;
- connection pooling.

Evitar banco exposto publicamente.

---

## 30. Observabilidade

Registrar:

```text
request_id
user_id
session_id
latency
AI provider
AI model
tokens_in
tokens_out
AI latency
embedding latency
vector search latency
database latency
error
```

Sem conteúdo sensível integral.

---

## 31. GitHub e CI/CD

### Frontend

```text
GitHub
   ↓
Cloudflare Pages
```

### Backend

```text
GitHub Actions
   ↓
Artifact Registry
   ↓
Docker image
   ↓
Cloud Run
```

### Pull Request

Executar:

```text
lint
typecheck
tests
build
```

### Produção

Ambientes:

```text
development
staging
production
```

---

## 32. MVP

### MVP 1

- cadastro;
- login;
- Firebase Auth;
- conversa com IA;
- pergunta inicial;
- streaming;
- histórico;
- salvar conversa;
- timeline simples;
- memória semântica básica;
- PWA.

### MVP 2

- calendário;
- busca;
- pessoas;
- projetos;
- temas;
- revisão semanal;
- “Pergunte à minha vida”.

### MVP 3

- insights;
- timeline inteligente;
- revisão mensal;
- voz;
- fotos;
- documentos;
- revisão anual;
- livro anual.

---

## 33. O que não usar inicialmente

Evitar:

- Kubernetes;
- GKE;
- Kafka;
- Redis;
- Elasticsearch;
- GraphQL;
- event sourcing;
- microsserviços excessivos.

Arquitetura do MVP:

```text
Cloudflare Pages
+
Cloud Run API
+
Cloud Run Worker
+
Cloud SQL PostgreSQL
+
pgvector
+
Cloud Tasks
+
Firebase Auth
+
AI Provider
```

---

## 34. Métricas

North Star Metric:

**Weekly Meaningful Journal Sessions**

Acompanhar:

- DAU;
- WAU;
- MAU;
- D1 retention;
- D7 retention;
- D30 retention;
- sessões por usuário;
- mensagens por sessão;
- entradas registradas;
- uso de voz;
- uso de memória;
- uso de busca;
- custo de IA por usuário ativo.

---

## 35. Filosofia final

O usuário não deveria pensar:

> Preciso escrever meu diário.

Ele deveria pensar:

> Vou conversar cinco minutos.

E o diário acontece automaticamente.

A proposta central do Memora é:

> **A IA não deveria apenas conversar com você. Ela deveria lembrar da sua história com você.**
