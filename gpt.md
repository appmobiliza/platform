### User

Quais são as alternativas atuais para hospedar um backend em Node.js? Minha atual opção é fazer tanto o front quanto o back num Turborepo em Next.js para hospedar gratuitamente na Vercel.

A opção precisa ser viável pois o projeto deve continuar rodando sem interrupções após o fim da passagem de minha equipe pela matéria

### Assistant

Sua ideia (Next.js + Turborepo + Vercel)**é válida**, mas tem um ponto crítico que você precisa encarar desde já:

👉**Vercel NÃO é um backend tradicional**Ele roda Node como**serverless functions**, não como servidor persistente.

Isso tem implicações:

- ❌ sem WebSockets duradouros
- ❌ sem jobs contínuos (workers, filas)
- ❌ limites de execução
- ✅ excelente pra APIs simples / CRUD / SSR

# 🧠 O que você realmente precisa decidir

Antes das opções, a pergunta-chave:

👉 Seu backend é:

- **Simples (CRUD + auth + requests curtas)**→ serverless funciona
- **Complexo (tempo real, filas, estado persistente)**→ precisa de servidor real

# 🔥 Opções reais em 2026 (com análise prática)

## 1. 🟢 Vercel (sua ideia atual)

**Melhor para:**simplicidade + zero custo + integração total

- Serverless Node integrado ao Next.js
- Deploy automático
- Free tier generoso

👉 Problema:

- Não escala bem como backend “de verdade”

👉 Veredito:✔ Ótimo pra MVP e projeto acadêmico⚠ Pode virar gargalo depois

## 2. 🟢 Render (o melhor equilíbrio hoje)

**Melhor para:**backend real com custo zero inicial

- Node rodando como servidor (Express, Nest, etc.)
- Free tier disponível
- Deploy via Git

👉 Limitações:

- Dorme após inatividade (cold start de ~30–60s)

👉 Veredito:✅ Melhor escolha “segura” pra seu caso👉 Muito usado como substituto do Heroku

## 3. 🟡 Railway

**Melhor para:**experiência dev MUITO simples

- Deploy extremamente rápido
- Banco integrado fácil

👉 Problema:

- Não tem free tier contínuo (só crédito inicial)

👉 Veredito:⚠ Não é ideal pro seu requisito de continuidade gratuita

## 4. 🟡 Fly.io

**Melhor para:**backend mais robusto / distribuído

- Roda container real (Docker)
- Deploy global
- Tem free allowance

👉 Problema:

- Mais complexo
- exige config (Docker, CLI)

👉 Veredito:🧠 Excelente tecnicamente⚠ Overkill pro seu projeto acadêmico

## 5. 🔵 Cloudflare (Workers / Pages)

**Melhor para:**backend leve ultra barato

- Edge functions (super rápido)
- Free tier generoso

👉 Problema:

- NÃO é Node “puro” (ambiente V8)

👉 Veredito:⚠ Só vale se você adaptar arquitetura

## 6. 🟣 VPS + Docker (Hetzner, Oracle, etc.)

**Melhor para:**controle total + longo prazo

- Backend real sem limitações
- Pode sair praticamente de graça (Oracle free tier)

👉 Problema:

- Você vira o DevOps
- manutenção é sua

👉 Veredito:🧠 Melhor solução “definitiva”⚠ pior experiência pra disciplina

# 🧩 Arquitetura recomendada (pra você)

Se o objetivo é:

✔ rodar sozinho depois✔ não quebrar✔ não pagar

👉 use isso:

### 🔥 Melhor setup equilibrado

- **Frontend:**Vercel
- **Backend:**Render
- **Banco:**Supabase / Neon

👉 Esse combo é literalmente o padrão atual

# 🧾 Comparação direta
OpçãoFácilGratuito contínuoBackend realRisco futuroVercel only⭐⭐⭐⭐⭐⭐⭐⭐⭐❌médioRender⭐⭐⭐⭐⭐⭐⭐⭐✅baixoRailway⭐⭐⭐⭐⭐❌✅altoFly.io⭐⭐⭐⭐⭐✅baixoVPS⭐⭐⭐⭐⭐⭐✅muito baixo
# 🎯 Veredito final (sem enrolação)

👉**Se quer simplicidade:**Use só Vercel (serve pro projeto)

👉**Se quer algo que não vai quebrar depois:**👉**Vercel + Render é a melhor escolha hoje**

👉**Se quer nível profissional real:**Vercel + Fly.io ou VPS

Se quiser, posso te montar**a arquitetura exata do seu MobiUFAL (com rotas, auth, banco e deploy)**já pensando em evitar qualquer dor futura.

### User

Mas aí como o backend ficaria estruturado?

### Assistant

Boa pergunta — aqui é onde a maioria dos projetos quebra depois. Se você separar**Vercel (front)**+**Render (backend)**, precisa deixar o backend**organizado como serviço independente**, não “acoplado ao Next”.

Vou te mostrar uma estrutura que é simples, profissional e sustentável.

# 🧩 Estrutura do monorepo (appmobiliza/platform)
```
platform/
├── apps/
│   ├── dashboard/        # Next.js (admin)
│   └── api/              # Backend Node (Express/Nest)
│
├── packages/
│   ├── types/            # Tipos compartilhados (TS)
│   ├── utils/            # Funções comuns
│   └── config/           # configs (eslint, tsconfig, etc.)
│
├── infra/
│   └── docker/           # (opcional, futuro)
│
├── package.json
├── turbo.json
└── README.md
```

# 🔧 Backend (como ele deve ser)

Você NÃO vai usar API routes do Next.

👉 Em vez disso:

- um app Node separado (`apps/api`)
- rodando Express ou NestJS
- deployado no Render

## Estrutura do backend (apps/api)
```
api/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── rides/        # deslocamentos
│   │   └── requests/     # solicitações
│   │
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   ├── middlewares/
│   ├── config/
│   └── server.ts
│
├── package.json
└── tsconfig.json
```

## Exemplo mínimo (Express)
```
// src/server.ts
import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.send("OK");
});

app.listen(process.env.PORT || 3001, () => {
  console.log("API running");
});
```

# 🔗 Comunicação frontend ↔ backend

No dashboard (Next.js):
```
const API_URL = process.env.NEXT_PUBLIC_API_URL;

fetch(`${API_URL}/requests`);
```

## Variáveis de ambiente

**Vercel (frontend):**
```
NEXT_PUBLIC_API_URL=https://api-mobiliza.onrender.com
```

**Render (backend):**
```
DATABASE_URL=...
JWT_SECRET=...
```

# 🧠 Por que essa arquitetura funciona

### ✅ Separação real

- Front não depende do back
- Deploy independente

### ✅ Escalável

- Dá pra trocar backend depois
- Dá pra adicionar mobile fácil

### ✅ Sustentável

- Se alguém da equipe sair, não quebra tudo

# 🔥 Fluxo completo

- Usuário (mobile/web)
- → chama API (Render)
- → API processa + banco
- → resposta volta pro front

# 🗄️ Banco de dados (importante)

Use algo gerenciado:

- **Supabase**→ melhor opção geral
- **Neon**→ alternativa leve

👉 ambos têm free tier estável

# ⚠️ Erro comum (evite isso)

❌ Colocar tudo dentro do Next.js→ vira dependente da Vercel→ difícil migrar→ limita backend

# 🎯 Veredito final

👉 Estruture assim:

- `apps/dashboard`→ Vercel
- `apps/api`→ Render
- `packages/*`→ compartilhado

👉 Isso te dá:

- simplicidade
- profissionalismo
- continuidade após a disciplina

Se quiser,posso te montar um**template pronto com Turborepo + Express + Next + deploy no Render/Vercel**já configurado.

### User

Meu plano era usar tRPC para rodar tudo num Turborepo

### Assistant

Dá pra fazer — mas você precisa decidir**onde o tRPC vai rodar**. O erro comum é assumir que “tRPC = tudo no Next na Vercel” resolve pra sempre. Resolve no começo, mas te prende ao modelo serverless.

Vou te mostrar as duas formas**reais**de usar tRPC no seu caso — e qual faz mais sentido pro seu objetivo (continuidade sem dor depois da disciplina).

# 🧠 Opção 1 — tRPC dentro do Next (Vercel)

### Estrutura
```
apps/
├── web/        # Next.js + tRPC
├── mobile/     # consome via HTTP
```

### Como funciona

- tRPC roda em**API routes / server actions**
- Backend = funções serverless da Vercel

### ✅ Vantagens

- setup rápido
- tipagem end-to-end (principal benefício do tRPC)
- menos código de infra

### ❌ Problemas reais

- acoplado ao Next.js
- limitado a serverless
- difícil evoluir (workers, filas, tempo real)
- mobile não consome tRPC tão naturalmente (vira HTTP anyway)

# 🧠 Opção 2 — tRPC como backend separado (recomendado)

👉 Aqui você usa tRPC**do jeito certo em arquitetura moderna**

## 🧩 Estrutura ideal no Turborepo
```
platform/
├── apps/
│   ├── dashboard/     # Next.js (Vercel)
│   ├── api/           # tRPC server (Render)
│
├── packages/
│   ├── api/           # routers tRPC (compartilhado)
│   ├── types/
│   └── utils/
```

## 🔧 Como funciona

- `apps/api`→ servidor Node (Express/Fastify)
- `packages/api`→ definição dos routers tRPC
- `apps/dashboard`→ consome via tRPC client

## Exemplo simplificado

### Router (compartilhado)
```
// packages/api/router.ts
import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  getRequests: publicProcedure.query(() => {
    return [];
  }),
});
```

### Backend (Render)
```
// apps/api/server.ts
import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "@repo/api";

const app = express();

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
  })
);

app.listen(3001);
```

### Frontend (Next.js)
```
// apps/dashboard
const { data } = trpc.getRequests.useQuery();
```

# 🔥 Por que essa abordagem é melhor

### ✅ Continua usando tRPC (tipagem end-to-end)

### ✅ Backend desacoplado do Next

### ✅ Funciona com mobile de verdade

### ✅ Pode sair da Vercel amanhã sem reescrever tudo

### ✅ Evita limitações de serverless

# ⚠️ Ponto crítico sobre mobile

tRPC**não é ideal para mobile puro**.

👉 solução prática:

- usar tRPC no web/dashboard
- expor também endpoints REST (ou usar o adapter HTTP padrão)

# 🧠 Decisão estratégica (o que você deve fazer)

Se seu objetivo é:

### 🎓 Só passar na disciplina

👉 tRPC dentro do Next (mais simples)

### 🚀 Projeto que pode continuar depois

👉**tRPC como backend separado (Render)**← escolha certa

# 🧾 Veredito final

👉 Seu plano com tRPC é bom👉 Mas**não rode ele só no Next**

Use:

- tRPC ✅
- Turborepo ✅
- Backend separado ✅

👉 Resultado:**mesma DX incrível + arquitetura sustentável**

Se quiser,posso te montar um**template exato com tRPC + Turborepo + deploy (Vercel + Render)**já pronto pra usar no teu projeto.

### User

Sim, sim, o tRPC rodaria totalmente desacoplado do Next.js. Seria integrado com maior facilidade mas também rodaria no mobile.
Aliás, estava planejando utilizar Drizzle para tentar facilitar uma futura migração para uma outra tecnologia de backend, como Nest.js

### Assistant

Agora sim — isso já está com cara de arquitetura bem pensada 👍

tRPC desacoplado + Drizzle é uma combinação forte, mas tem um detalhe importante:**isso não te deixa automaticamente pronto pra migrar pra NestJS**. Ajuda, mas só se você estruturar direito desde o começo.

Vou te mostrar como fazer isso do jeito certo (e onde normalmente dá errado).

# 🧠 O ponto-chave da sua ideia

Você quer:

- tRPC agora (produtividade + tipagem)
- possibilidade de migrar depois (ex: NestJS)
- backend reutilizável pro mobile

👉 Isso só funciona se você**isolar o domínio da API**.

# 🧩 Estrutura ideal (pensando na futura migração)
```
platform/
├── apps/
│   ├── api/              # servidor (tRPC hoje)
│   ├── dashboard/        # Next.js
│   └── mobile/
│
├── packages/
│   ├── domain/           # 💥 regra de negócio (ESSENCIAL)
│   ├── db/               # Drizzle (schemas + client)
│   ├── api/              # routers tRPC
│   ├── types/
│   └── utils/
```

# 🔥 Separação que salva seu futuro

## 1. packages/domain (o mais importante)

Aqui fica a lógica REAL:
```
// domain/requests/createRequest.ts
export async function createRequest(data, db) {
  // validação
  // regra de negócio
  // persistência
}
```

👉 Isso NÃO pode depender de:

- tRPC ❌
- Express ❌
- Next ❌

## 2. packages/api (camada tRPC)
```
// só orquestra
createRequest: publicProcedure
  .input(schema)
  .mutation(({ input, ctx }) => {
    return createRequest(input, ctx.db);
  });
```

👉 Aqui é só “adaptador”, não lógica.

## 3. packages/db (Drizzle)

- schemas
- conexão
- migrations

👉 totalmente isolado

# ⚠️ Onde Drizzle realmente ajuda (e onde não)

## ✅ Ajuda em:

- evitar lock-in de ORM
- queries explícitas
- tipagem forte

## ❌ NÃO resolve:

- acoplamento com tRPC
- arquitetura ruim
- dependência de framework

👉 Quem resolve isso é**a separação de camadas**, não o ORM.

# 🧠 Sobre migrar pra NestJS depois

Se você fizer isso certo:

👉 Migrar vira basicamente:
```
- tRPC router
+ NestJS controller
```

E você reaproveita:

- domain ✅
- db (Drizzle) ✅
- types ✅

## Exemplo mental

Hoje (tRPC):
```
router.createRequest → domain.createRequest()
```

Amanhã (Nest):
```
@Post()
create() {
  return createRequest();
}
```

👉 Mesma lógica, zero retrabalho

# 📱 Sobre mobile + tRPC

Você está certo, mas com uma nuance:

### Funciona:

- via HTTP (tRPC client)
- ou via wrapper

### Problema:

- ecossistema mobile não é “tRPC-first”

👉 solução comum:

- manter tRPC
- opcionalmente expor REST no futuro

# 🧾 Stack final (muito bem montada)

Se seguir isso:

- tRPC (API layer)
- Drizzle (DB)
- Turborepo (monorepo)
- Render (backend)
- Vercel (frontend)

👉 isso já é**nível startup real**, não só projeto acadêmico

# 🎯 Veredito direto

👉 Sua ideia é boa👉 Mas só funciona de verdade se você:

- separar**domain**da API
- usar tRPC como**adaptador, não como núcleo**
- tratar Drizzle como infra, não arquitetura

Se fizer isso, você ganha:

✔ facilidade agora✔ liberdade depois✔ zero reescrita na migração

Se quiser,posso te montar um**esqueleto de pastas + código inicial (já com domain + tRPC + Drizzle integrados)**pronto pra você começar sem tropeçar.

### User

Eu consigo de forma tranquila expor as rotas do tRPC via API rest que pode ser requisitada pelo app mobile via HTTP?

### Assistant

Curto e direto:**não é “de graça”, mas é totalmente viável — e comum — expor REST junto com tRPC**. Só não caia na ideia de “converter automaticamente tRPC → REST”; na prática você cria**uma camada fina REST**que chama o mesmo domínio que o tRPC.

# 🧠 O princípio correto

👉**tRPC e REST são só “adaptadores”**👉 O que importa é você já ter separado:

- `domain/`→ regras de negócio
- `db/`→ Drizzle
- `api/`→ tRPC

A REST entra como**mais um adapter**, não substituição.

# 🧩 Como fazer na prática

Você já tem:
```
domain → lógica
tRPC → usa domain
```

Agora adiciona:
```
REST → usa domain (igual tRPC)
```

## 🔧 Exemplo real

### 1. Domínio (reutilizado)
```
// packages/domain/createRequest.ts
export async function createRequest(data, db) {
  // regra de negócio
}
```

### 2. tRPC (já existe)
```
createRequest: publicProcedure
  .input(schema)
  .mutation(({ input, ctx }) => {
    return createRequest(input, ctx.db);
  });
```

### 3. REST (nova camada)
```
// apps/api/rest/routes.ts
import express from "express";
import { createRequest } from "@repo/domain";

const router = express.Router();

router.post("/requests", async (req, res) => {
  const result = await createRequest(req.body, req.app.locals.db);
  res.json(result);
});

export default router;
```

### 4. Servidor
```
app.use("/api", restRoutes);
app.use("/trpc", trpcMiddleware);
```

# 🔥 Resultado

Você passa a ter:

- `/trpc/*`→ usado pelo dashboard (tipado)
- `/api/*`→ usado pelo mobile (REST padrão)

👉 Mesma lógica, duas interfaces

# ⚠️ O erro que você deve evitar

❌ Tentar “transformar automaticamente” tRPC em REST(ex: wrappers mágicos)

Isso:

- quebra validação
- perde controle de contrato
- vira bagunça rápido

# 📱 Sobre o mobile

Agora você tem liberdade:

### Opção A (mais simples)

- Mobile consome REST (`/api`)
- Web usa tRPC

### Opção B (mais avançada)

- Mobile usa tRPC client HTTP

👉 Na prática, 90% dos projetos escolhem REST no mobile pela simplicidade.

# 🧠 Quando vale a pena expor REST

✔ você tem mobile✔ quer API pública no futuro✔ quer desacoplar totalmente frontend

# 🧾 Veredito final

👉 Sim, você consegue expor REST**sem dor**👉 Mas o caminho certo é:

**não adaptar tRPC → REST**👉 e sim:**ambos consumirem o mesmo domínio**

Se quiser,posso te sugerir um padrão de rotas REST já alinhado com seu domínio (requests, rides, usuários) pra deixar isso consistente desde o começo.

### User

Mas aí eu teria que criar uma rota tanto para tRPC quanto para REST manualmente toda vez?

### Assistant

Não necessariamente — e esse é exatamente o ponto onde muita gente simplifica errado a arquitetura.

Se você fizer**tRPC + REST como camadas separadas “com lógica duplicada”**, sim: vira retrabalho.Mas no modelo correto (o que você está tentando montar), você não cria duas vezes a lógica — você só cria dois*adaptadores*leves.

# 🧠 Regra de ouro

👉**Você nunca duplica regra de negócio**👉 Você só duplica “forma de acesso”

# 🧩 Como evitar duplicação real

Você estrutura assim:
```
domain (lógica única)
   ↑        ↑
 tRPC     REST
```

# 🔥 O truque: “handlers reutilizáveis”

Em vez de escrever lógica dentro das rotas, você centraliza tudo:

## 1. Domínio (único lugar da lógica)
```
export async function createRequest(input, db) {
  // validação
  // regras de negócio
  // persistência
  return db.insert(...)
}
```

## 2. tRPC (adapter fino)
```
createRequest: publicProcedure
  .input(schema)
  .mutation(({ input, ctx }) => {
    return createRequest(input, ctx.db);
  });
```

## 3. REST (mesma coisa)
```
router.post("/requests", async (req, res) => {
  const result = await createRequest(req.body, req.app.locals.db);
  res.json(result);
});
```

# 💡 O que isso resolve

✔ você NÃO duplica lógica✔ você NÃO reescreve regras✔ só cria “entrada diferente”

# 🚀 E se quiser ir além (nível mais limpo ainda)

Você pode padronizar tudo em**handlers únicos**:
```
export const requestHandler = {
  create: createRequest,
  list: listRequests,
};
```

E tanto tRPC quanto REST só chamam isso.

# ⚠️ O que NÃO fazer

❌ duplicar lógica em:

- tRPC router
- REST route
- service separado sem padrão

Isso vira caos em semanas.

# 🧠 Resposta direta à sua pergunta

“Vou ter que criar rota duas vezes toda vez?”

👉**Não.**

Você vai criar:

- 1 função de domínio (ou handler)
- 2 formas de expor (tRPC e REST)

Mas**sem duplicar lógica nenhuma**.

# 🎯 Veredito final

Se seu objetivo é:

- mobile + web
- tRPC para DX
- REST para compatibilidade
- futuro migrável

👉 Esse modelo é**exatamente o correto**

E na prática:

o “custo extra” não é duplicação de código, é só uma camada de adaptação.

Se quiser,posso te desenhar uma estrutura ainda mais otimizada onde até REST e tRPC são gerados a partir de um mesmo schema de input/output(nível bem mais avançado, mas muito limpo).

### User

Desenhe uma estrutura ainda mais otimizada onde REST e tRPC são gerados a partir de um mesmo schema de input/output

### Assistant

Dá pra ir um nível acima sim — e aí você entra num padrão bem usado em sistemas mais “sérios”:**contrato único + múltiplos adapters gerados a partir dele**.

A ideia central é:

👉**o schema define tudo (input, output e validação)**👉 tRPC e REST só “plugam” nesse contrato

# 🧠 Arquitetura: “Contract-first + adapters”
```
platform/
├── apps/
│   ├── api/            # tRPC + REST server
│   ├── dashboard/      # Next.js
│   └── mobile/
│
├── packages/
│   ├── contracts/      # 💥 fonte única da verdade
│   ├── domain/         # regras de negócio
│   ├── db/             # Drizzle
│   ├── adapters/
│   │   ├── trpc/
│   │   └── rest/
│   └── utils/
```

# 🧩 1. Contracts (o coração do sistema)

Aqui você define**input + output + validação**.

Exemplo com Zod:
```
import { z } from "zod";

export const CreateRequestSchema = z.object({
  userId: z.string(),
  origin: z.string(),
  destination: z.string(),
});

export const RequestSchema = z.object({
  id: z.string(),
  status: z.enum(["pending", "accepted", "done"]),
});
```

👉 Isso é o contrato único.

# 🧠 2. Domain (regra de negócio pura)
```
import { CreateRequestSchema } from "@repo/contracts";

export async function createRequest(input, db) {
  const data = CreateRequestSchema.parse(input);

  return db.request.create({
    data,
  });
}
```

👉 Zero conhecimento de HTTP, tRPC ou REST.

# ⚡ 3. Adapter tRPC (gerado a partir do contrato)
```
import { CreateRequestSchema } from "@repo/contracts";
import { createRequest } from "@repo/domain";

export const appRouter = router({
  createRequest: publicProcedure
    .input(CreateRequestSchema)
    .mutation(({ input, ctx }) => {
      return createRequest(input, ctx.db);
    }),
});
```

# 🌐 4. Adapter REST (mesmo contrato)
```
import { CreateRequestSchema } from "@repo/contracts";
import { createRequest } from "@repo/domain";

router.post("/requests", async (req, res) => {
  const input = CreateRequestSchema.parse(req.body);

  const result = await createRequest(input, req.db);

  res.json(result);
});
```

# 🚀 O pulo do gato (nível avançado)

Agora você pode ir além e**eliminar duplicação até de parsing**:

### Criar helper de adapter
```
export function restHandler(schema, handler) {
  return async (req, res) => {
    const input = schema.parse(req.body);
    const result = await handler(input, req.db);
    res.json(result);
  };
}
```

Uso:
```
router.post(
  "/requests",
  restHandler(CreateRequestSchema, createRequest)
);
```

👉 Isso reduz REST a 1 linha por endpoint.

# 🧠 O que você ganha com isso

## ✔ Single source of truth

- contratos únicos

## ✔ Zero duplicação real

- tRPC e REST são só “skins”

## ✔ Migração futura fácil

- NestJS só reutiliza domain + contracts

## ✔ Mobile compatível

- REST limpo e previsível

## ✔ Tipagem forte

- contracts podem gerar types TS automaticamente

# 🔥 Evolução possível (nível profissional real)

Se quiser ir além ainda:

### 1. OpenAPI automático

Contracts → Swagger

### 2. Client generation

Contracts → mobile SDK

### 3. Event-driven futuro

Domain → eventos

# ⚠️ Importante (onde não exagerar)

Esse modelo é ótimo, mas:

❌ não vale a pena se:

- o projeto for pequeno
- não houver mobile real
- só for demo simples

# 🎯 Veredito final

Você está descrevendo uma arquitetura de nível:

👉**“contract-first backend architecture”**

E o melhor desenho pra você é:

- contracts = verdade absoluta
- domain = lógica pura
- tRPC + REST = adapters finos gerados sobre o mesmo contrato

Se quiser, posso te montar uma versão**100% pronta com Turborepo + Zod contracts + tRPC + REST helper + Drizzle já encaixado**, que você literalmente só roda e começa a implementar regras.

### User

Qual seria a melhor biblioteca mobile para mapas para React Native dado o contexto do projeto?

### Assistant

Para o teu contexto (React Native + Expo + tRPC + possível crescimento + uso em universidade + app com geolocalização e possivelmente muitos pontos), a escolha de mapas não é só “qual é mais popular”, mas sim:

**facilidade de integração + estabilidade + custo zero + flexibilidade futura**

Vou te dar a resposta direta primeiro, depois o porquê.

# 🏆 Melhor escolha no teu caso

## 👉 react-native-maps (Google Maps / Apple Maps)

É o padrão mais seguro hoje para React Native com Expo.

react-native-maps

## Por que ele é o melhor pra você

### ✅ 1. Funciona direto com Expo

- já vem suportado no Expo Go / Dev Build
- zero dor inicial pra MVP

### ✅ 2. Suporte híbrido real

- Android → Google Maps
- iOS → Apple Maps ou Google Maps

👉 isso é importante pro teu app acadêmico (heterogeneidade de dispositivos)

### ✅ 3. Ecossistema maduro

- clustering
- markers customizados
- tracking de localização
- rotas (via libs externas)

### ⚠️ Limitação real

- não é o mais avançado para mapas complexos
- não é tão customizável quanto Mapbox

# 🥈 Segunda melhor opção (se quiser nível mais avançado)

## 👉 Mapbox / MapLibre

MapboxMapLibre

### Vantagens

- mapas altamente customizáveis
- melhor performance em dados grandes
- estilo visual controlado
- melhor para sistemas tipo “Uber-like”

### Desvantagens

- mais setup
- mais complexidade
- mais decisões técnicas cedo demais pro teu estágio

# 🧠 E o “expo-maps”?

expo-maps

- ainda**alpha**
- muda rápido
- não é ideal pra projeto que precisa sobreviver depois da disciplina

👉 eu não recomendaria aqui.

# 📊 Comparação direta pro teu caso
Critérioreact-native-mapsMapboxexpo-mapsFacilidade no Expo⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐Estabilidade⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐Customização⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐Tempo de setup⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐Ideal pro teu projeto🟢 sim🟡 talvez🔴 não
# 🎯 Veredito honesto (importante)

Para o teu sistema (MobiUFAL):

👉 não é um app de mapas complexos👉 é um app de**logística + rastreamento + pontos no campus**

Então o melhor caminho é:

## 🥇 Escolha final recomendada:

**react-native-maps + Google Maps**

# 💡 Dica arquitetural importante (mais importante que a lib)

Independente da lib:

👉 NÃO acople lógica de negócio no mapa👉 o mapa só exibe dados vindos do backend (tRPC/REST)

Exemplo:

- backend define “onde está o bolsista”
- mapa só renderiza

# 🧾 Conclusão

Se fosse um ranking final para o teu projeto:

- 🥇 react-native-maps (melhor escolha geral)
- 🥈 Mapbox (se virar produto grande no futuro)
- 🥉 expo-maps (ainda imaturo pra teu caso)

Se quiser, posso te ajudar a desenhar exatamente como integrar isso com:

- tRPC (requests de localização em tempo real)
- Drizzle (storage de rotas e eventos)
- WebSocket (atualização de bolsistas no mapa)

Isso aí é o próximo nível da tua arquitetura.

### User

Qual o melhor para exibir com facilidade os bolsistas (sprite que rotaciona com base na orientação da pessoa no mundo real), a posição atual do aluno e a rota entre os dois (path)?

### Assistant

Para esse tipo de app (bolsistas se movendo + aluno + rota em tempo real), o “melhor” não é só a biblioteca de mapa — é a combinação entre**map engine + tracking + routing + atualização em tempo real**.

Vou te dar a resposta direta primeiro:

👉**react-native-maps + Google Maps Directions API + location tracking (Expo Location ou native)**é a solução mais prática e correta pro teu caso.

# 🏆 Melhor escolha para o teu cenário

## 👉 Stack recomendada

- **Mapa:**react-native-maps
- **Rotas:**Google Maps Directions API
- **Localização em tempo real:**Expo Location (ou react-native-geolocation-service em dev build)
- **Orientação (rotação do sprite):**heading/bearing do GPS

# 🧠 Por que isso é o melhor para o teu caso

Tu queres 3 coisas:

## 1. 👤 Sprite do bolsista rotacionando

👉 Precisa de**heading (bússola do dispositivo)**
```
Location.watchHeadingAsync(...)
```

Ou:
```
coords.heading
```

Isso te permite:

- rotacionar o marker
- mostrar direção real de movimento

## 2. 📍 Posição do aluno + bolsista

Isso é trivial com:

- `Marker`do react-native-maps
```
<Marker
  coordinate={coords}
  rotation={heading}
/>
```

## 3. 🛣️ Rota entre os dois (path)

Aqui entra o ponto crítico:

👉 O mapa NÃO calcula rotas sozinho

Você usa:

## 👉 Google Maps Directions API

Retorna:

- polyline (linha da rota)
- distância
- duração

### Exemplo de fluxo:

- backend ou app chama:
```
origin = bolsista
destination = aluno
```

- Google retorna polyline
- você desenha:
```
<Polyline coordinates={decodedRoute} />
```

# 🎯 E por que NÃO usar Mapbox como padrão aqui?

Mapbox seria ótimo para:

- customização avançada
- mapas estilizados
- grandes volumes de dados

Mas no teu caso:

❌ overkill❌ mais setup❌ mais fricção com Expo

👉 não te dá vantagem real sobre Google Maps aqui

# ⚡ Como o “sprite que rotaciona” funciona na prática

Tu precisas de 3 coisas:

## 1. heading do GPS

- direção em graus (0–360)

## 2. suavização

porque GPS é instável

## 3. animação
```
rotation={animatedHeading}
```

# 🧩 Arquitetura ideal (bem alinhada com teu projeto)
```
mobile/
├── map/
│   ├── MapView.tsx
│   ├── markers/
│   │   ├── StudentMarker.tsx
│   │   ├── AssistantMarker.tsx
│   ├── routes/
│   │   ├── RoutePolyline.tsx
│
├── services/
│   ├── location.ts
│   ├── directions.ts
```

# 🔥 Tempo real (o diferencial do teu projeto)

Se quiser ficar realmente forte:

- bolsista envia posição a cada X segundos
- backend distribui via WebSocket ou polling leve
- aluno recebe updates

👉 isso cria “Uber-like tracking”

# 🧠 Resumo honesto

## Melhor solução prática:

### 🥇 react-native-maps + Google Maps

✔ markers fáceis✔ rotação nativa✔ polyline pronta✔ suporte forte✔ integração simples com Expo

## Melhor combinação completa:

- Map: react-native-maps
- Rotas: Google Directions API
- Tracking: Expo Location
- Backend sync: tRPC + polling/WebSocket

# 🎯 Veredito final

Para o teu projeto (mobilidade no campus):

👉**react-native-maps é a escolha certa sem discussão técnica excessiva**

E o diferencial não está no mapa — está em:

- atualização em tempo real
- qualidade da rota
- consistência do tracking

Se quiser,posso te desenhar o**fluxo completo tipo Uber (bolsista → aluno → rota → atualização em tempo real)**já integrado com teu backend tRPC.

### User

Desenhe o fluxo completo tipo Uber já integrado com meu backend tRPC

### Assistant

Vou desenhar o fluxo como um sistema “Uber simplificado”, mas adaptado ao teu caso (MobiUFAL), usando**tRPC + mobile + dashboard + tracking em tempo real**.

# 🧠 Visão geral do sistema (alto nível)
```
[Aluno (App)]
      ↓ solicita corrida
      ↓
   tRPC API (backend)
      ↓ cria REQUEST
   DB (Drizzle)

      ↓
[Dispatch / Matching Service]
      ↓ encontra bolsista disponível

      ↓
[Notificação para bolsista]
      ↓ aceita corrida

      ↓
[Tracking em tempo real]
(bolsista → aluno)
      ↓
[Mapa no app do aluno]
```

# 🧩 1. Fluxo de criação da solicitação (Aluno → Backend)

## 📱 App (Aluno)
```
trpc.request.create.mutate({
  origin: { lat, lng },
  destination: { lat, lng },
});
```

## 🧠 Backend (tRPC)
```
create: publicProcedure
  .input(CreateRequestSchema)
  .mutation(async ({ input, ctx }) => {
    return createRequest(input, ctx.db);
  });
```

## 🗄️ Domain
```
export async function createRequest(input, db) {
  return db.request.create({
    data: {
      ...input,
      status: "SEARCHING_BOLSEIRO",
    },
  });
}
```

# 🚦 2. Matching (tipo Uber “dispatch”)

Aqui entra o “cérebro” do sistema.
```
export async function findAvailableAssistant(db, location) {
  return db.assistant.findMany({
    where: {
      available: true,
      proximity: location,
    },
  });
}
```

## Resultado:

- sistema seleciona bolsista mais próximo
- muda status da request
```
status = "ASSIGNED"
assistantId = X
```

# 📲 3. Notificação para bolsista
```
trpc.assistant.notify({
  requestId,
  pickupLocation,
});
```

Bolsista vê:

- “Nova solicitação”
- distância
- aceitar / recusar

# ✅ 4. Aceite da corrida (Bolsista)
```
trpc.request.accept.mutate({
  requestId,
});
```

Atualiza backend:
```
status = "IN_PROGRESS"
```

# 📡 5. Tracking em tempo real (o coração do sistema)

## 📍 Bolsista envia posição
```
trpc.location.update.mutate({
  lat,
  lng,
  heading,
});
```

## 🧠 Backend salva + broadcast
```
broadcast("request:update", {
  requestId,
  location,
});
```

# 📱 6. Aluno recebe atualização (tempo real)
```
trpc.request.onUpdate.subscribe(({ data }) => {
  updateMarker(data.location);
});
```

# 🗺️ 7. Mapa (renderização final)

## Bolsista (sprite rotacionado)
```
<Marker
  coordinate={assistantLocation}
  rotation={heading}
/>
```

## Aluno
```
<Marker coordinate={studentLocation} />
```

## Rota (path)
```
<Polyline coordinates={routePolyline} />
```

# 🧭 8. Cálculo da rota
```
GET https://maps.googleapis.com/maps/api/directions
```

Retorna:
```
{
  polyline: "encoded_path"
}
```

# 🔄 Fluxo completo (resumo tipo Uber)
```
ALUNO
  ↓ cria request
tRPC API
  ↓ salva no DB
MATCHING ENGINE
  ↓ encontra bolsista
BOLSISTA
  ↓ aceita
STATUS = IN_PROGRESS
  ↓
GPS STREAMING (bolsista → backend)
  ↓
WEBSOCKET / SUBSCRIPTION
  ↓
ALUNO MAPA ATUALIZA EM TEMPO REAL
```

# ⚙️ Arquitetura final (organizada)
```
mobile/
  student/
  assistant/

apps/
  api (tRPC + WS)
  dashboard (admin)

packages/
  domain/
  db (Drizzle)
  contracts
  realtime (event bus)
```

# 🔥 O diferencial importante (nível “Uber-like” real)

Se quiser elevar o sistema:

## ✔ Event-driven layer

- request.created
- request.assigned
- location.updated

## ✔ Realtime infra

- WebSocket (ou tRPC subscriptions)
- ou Ably/Pusher se quiser simplificar

# 🎯 Veredito final

Você está essencialmente montando:

🚗 “Uber acadêmico de mobilidade assistida”

E o fluxo correto é:

- tRPC → API central
- Domain → regras reais
- Realtime → tracking
- Maps → só visualização

Se quiser,posso te desenhar a versão**“production-grade” desse sistema (com filas, fallback de bolsistas, timeout de aceitação e reatribuição automática)**— que é o que deixa isso realmente robusto em ambiente real.

### User

Desenhe a versão production-grade desse sistema com filas, fallback de bolsistas, timeout de aceitação e reatribuição automática

### Assistant

A versão “production-grade” desse sistema deixa de ser só um fluxo linear tipo Uber simples e vira um**sistema de dispatch resiliente**, com fila, estados bem definidos e recuperação automática de falhas.

Vou te desenhar isso de forma estruturada.

# 🧠 Arquitetura geral (produção)
```
[Aluno App]
    ↓ create request (tRPC)
[API tRPC + Domain Layer]
    ↓
[QUEUE / DISPATCH SYSTEM]
    ↓
[Matching Engine]
    ↓
[Pool de bolsistas disponíveis]

    ↓ (assign attempt)
[Bolsista]

    ↙        ↘
 aceita      não responde / recusa / timeout
    ↓               ↓
 IN_PROGRESS     fallback + retry
    ↓               ↓
 tracking      requeue / reassignment
```

# 🧩 1. Estados da solicitação (state machine)

Esse é o coração da robustez:
```
type RequestStatus =
  | "PENDING"
  | "SEARCHING_ASSISTANT"
  | "ASSIGNED"
  | "AWAITING_ACCEPTANCE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "REASSIGNING";
```

👉 Isso evita caos lógico.

# 🚦 2. Fila de dispatch (core do sistema)

Em vez de tentar direto, tudo entra numa fila:
```
request.created → enqueue(dispatchQueue)
```

## Implementação típica

Pode ser:

- Redis Queue (BullMQ)
- ou tabela “dispatch_jobs”
- ou Kafka (se fosse escala maior)

### Job de dispatch
```
{
  requestId,
  attempt: 1,
  status: "PENDING",
}
```

# 🧠 3. Matching Engine (com fallback)
```
async function findAssistants(request) {
  const nearby = await db.assistant.findMany({
    where: {
      available: true,
      proximity: request.origin,
    },
    orderBy: "distance",
  });

  return nearby;
}
```

# ⚡ 4. Tentativa com fallback (essência do sistema)
```
async function tryAssign(request) {
  const assistants = await findAssistants(request);

  for (const assistant of assistants) {
    const accepted = await notifyAndWait(assistant, request);

    if (accepted) {
      return assign(request, assistant);
    }
  }

  throw new Error("NO_AVAILABLE_ASSISTANTS");
}
```

# ⏱️ 5. Timeout de aceitação (crítico)

Cada bolsista tem uma janela de resposta:
```
const ACCEPT_WINDOW = 15_000; // 15s
```

## Lógica:
```
await Promise.race([
  waitForAcceptance(assistant, request),
  timeout(ACCEPT_WINDOW),
]);
```

## Se não responder:
```
markAssistantAsSkipped(assistant);
retryWithNext();
```

# 🔁 6. Reatribuição automática (fallback real)

Se ninguém aceitar:
```
async function reassign(request) {
  await delay(3000);

  const newBatch = await findNextBestAssistants(request);

  await enqueue({
    requestId: request.id,
    attempt: request.attempt + 1,
  });
}
```

## Estratégia inteligente:

- tentativa 1 → bolsistas próximos
- tentativa 2 → raio maior
- tentativa 3 → qualquer disponível
- tentativa 4 → alerta coordenação (NAC/Proest)

# 📡 7. Tracking em tempo real (durante execução)
```
assistant.location → stream → backend → aluno
```

Eventos:
```
location.updated
request.status.changed
assistant.assigned
```

# 🧱 8. Sistema de eventos (recomendado)

Em vez de lógica acoplada:
```
request.created
request.assigned
request.timeout
request.reassigned
request.completed
```

👉 isso permite escalar depois facilmente.

# 🧩 9. Fluxo completo production-grade
```
1. ALUNO cria request
   ↓
2. API salva + enfileira job
   ↓
3. DISPATCH WORKER pega job
   ↓
4. MATCHING ENGINE seleciona bolsistas
   ↓
5. NOTIFICAÇÃO em paralelo
   ↓
6. TIMEOUT 15s
      ├── aceita → IN_PROGRESS
      ├── recusa → próximo bolsista
      └── silêncio → fallback
   ↓
7. se ninguém aceita → REQUEUE com estratégia expandida
   ↓
8. durante execução:
      tracking em tempo real
   ↓
9. finalização → COMPLETED
```

# 🗺️ 10. Integração com mapas

- markers = estado atual
- polyline = rota dinâmica
- heading = direção do bolsista

# 🧠 11. Onde isso roda no teu stack
```
apps/api
  ├── tRPC (requests)
  ├── dispatcher worker
  ├── websocket server
```
```
packages/
  ├── domain (regras)
  ├── queue (jobs)
  ├── contracts (schemas)
```

# 🔥 O diferencial dessa arquitetura

## ✔ Resiliente

- não depende de 1 bolsista

## ✔ Escalável

- fila desacopla tudo

## ✔ Recuperável

- retries automáticos

## ✔ Observável

- estados claros

## ✔ Realista (nível Uber mesmo)

# 🎯 Veredito final

Você saiu de:

“app de solicitação de transporte”

para:

🚗**sistema de dispatch com fila, retry e matching inteligente**

Se quiser, posso te desenhar o próximo nível ainda mais avançado:

👉sistema com**prioridade (PcD urgente)**👉**score de bolsistas (performance ranking)**👉**otimização de rotas simultâneas (multi-request batching)**

### User

A Google Maps Directions API é gratuita? Se não, existe alguma forma de fazer isso in-house, para não depender de APIs externas?

### Assistant

Resposta direta:**não é totalmente gratuita**, e “fazer tudo in-house” é possível, mas muda bastante o nível de complexidade do teu projeto.

Vou separar em três níveis pra ficar claro.

# 🧭 1. Google Maps Directions API — é gratuita?

## ❌ Não é gratuita de forma ilimitada

Ela funciona no modelo:

- crédito mensal limitado (Google Cloud)
- depois disso, cobrança por requisição

### O que isso significa na prática:

- projetos pequenos: geralmente ficam dentro do free tier
- uso moderado: começa a gerar custo
- produção real: custo previsível, mas existe

## ⚠️ Pontos importantes

- precisa de billing ativo (cartão)
- não é ideal para depender “para sempre grátis”
- lock-in forte no ecossistema Google

# 🧠 2. Dá pra fazer “in-house” sem API externa?

## Sim — mas você não substitui o Google Maps inteiro

Você tem 3 alternativas reais:

# 🟡 Opção A — Map rendering + rota local simples

Você usa:

- OpenStreetMap
- Leafletou React Native Map

E calcula rotas com:

- algoritmos próprios (Dijkstra / A*)

### ✔ O que você consegue fazer

- mapas offline/abertos
- rota básica entre pontos
- controle total

### ❌ O que você perde

- precisão de rotas reais (ruas, restrições, trânsito)
- navegação “inteligente”
- dados atualizados automaticamente

# 🟠 Opção B — Rodar seu próprio motor de rotas

Você pode usar:

- OSRM
- ouGraphHopper

## Como funciona

Você baixa dados do OpenStreetMap e roda um servidor local:
```
OSM data → Graph → Routing engine → API local
```

## ✔ Vantagens

- zero custo por requisição
- controle total
- escala bem em campus fechado (teu caso!)

## ❌ Desvantagens

- setup complexo
- precisa servidor rodando 24/7
- manutenção de dados de mapa

# 🟢 Opção C (MELHOR pro teu projeto)

## 👉 “Híbrido inteligente”

Você NÃO tenta substituir Google completamente.

Você faz isso:

### 📍 Campus = sistema fechado

- nós (blocos, prédios) são fixos
- rotas podem ser pré-calculadas ou simplificadas

## Estrutura:
```
Graph do campus:
  IC → RU → Reitoria → Biblioteca
```

## Rota vira:

- shortest path em grafo local
- não precisa de API externa

### ✔ Vantagens enormes no teu caso

- zero custo
- ultra rápido
- previsível
- perfeito para ambiente universitário

# 🧠 Como ficaria no teu sistema

## Em vez de Google Directions:
```
getCampusRoute(origin, destination)
```

## Implementação:
```
const graph = {
  A: ["B", "C"],
  B: ["A", "D"],
  C: ["A", "D"],
  D: ["B", "C"],
};
```

→ BFS / Dijkstra simples

# 🔥 Resultado final da comparação
SoluçãoCustoComplexidadePrecisãoIdeal pra UFALGoogle Directions❌ pago (limitado free)baixo⭐⭐⭐⭐⭐bomOSRM/GraphHoppergratuitoalto⭐⭐⭐⭐muito bomGraph interno (campus)gratuitobaixo-médio⭐⭐⭐**PERFEITO**
# 🎯 Veredito honesto

👉 Para teu projeto (mobilidade em campus):

### 🥇 Melhor escolha:

**grafo interno do campus (in-house)**

### 🥈 Segunda melhor:

OSRM/GraphHopper se quiser escalar

### 🥉 Google Maps:

bom, mas desnecessário e potencialmente caro

# 💡 Insight importante

Teu problema NÃO é “navegação global”.

É:

“ir de ponto A para B dentro de um espaço controlado”

👉 Isso transforma tudo.

# 🚀 Se quiser evoluir ainda mais

Posso te ajudar a desenhar:

- mapa do campus como grafo otimizado
- algoritmo de rota (Dijkstra simplificado)
- integração com tRPC em tempo real
- sistema de atualização dinâmica (bloqueio de rotas, eventos)

Isso deixa teu projeto com cara de sistema real de logística interna, não só app de mapa.

### User

Escreva um texto para um documento que será enviado para a Adriana, coordenadora do NAC, destrinchando o escopo do projeto, as funcionalidades, a proposta, o objetivo, os artefatos que serão entregas e todos os outros detalhes referentes ao projeto a fim de que ela assine e nos envie o documento assinado para provarmos no momento de entrega que tudo foi feito como escrito.

### Assistant

**Documento de Apresentação e Validação de Escopo do Projeto MobiUFAL**

O presente documento tem como objetivo formalizar o escopo, funcionalidades, proposta e entregáveis do projeto MobiUFAL, desenvolvido no âmbito da disciplina de Projeto e Desenvolvimento de Sistemas, para validação junto à coordenação do Núcleo de Acessibilidade (NAC) da UFAL.

## 1. Visão Geral do Projeto

O MobiUFAL é um sistema digital de mobilidade assistida voltado ao atendimento de estudantes com deficiência (PcD) no ambiente universitário. O projeto propõe a substituição do fluxo manual atual por uma solução tecnológica integrada, composta por aplicação mobile, dashboard administrativa e backend centralizado, com o objetivo de tornar o serviço mais ágil, rastreável, organizado e confiável.

## 2. Problema Abordado

Atualmente, o processo de solicitação e atendimento de transporte assistido apresenta limitações operacionais, como baixa previsibilidade, ausência de rastreabilidade, dependência de comunicação manual e sobrecarga operacional dos bolsistas. Essas condições impactam diretamente a experiência dos estudantes PcD, resultando em atrasos, falhas de atendimento e dificuldade de gestão eficiente do serviço.

## 3. Objetivos do Sistema

O projeto tem como objetivos principais:

- Melhorar a eficiência operacional do serviço de mobilidade assistida;
- Garantir maior previsibilidade e confiabilidade no atendimento aos estudantes;
- Reduzir a sobrecarga operacional dos bolsistas;
- Fornecer dados estruturados e rastreáveis para gestão institucional;
- Promover maior transparência e controle sobre o fluxo de solicitações e atendimentos.

## 4. Escopo Funcional

O sistema será composto pelos seguintes módulos:

### 4.1 Aplicação Mobile (Estudantes e Bolsistas)

- Solicitação de transporte assistido;
- Acompanhamento em tempo real do atendimento;
- Visualização de localização e status da solicitação;
- Recebimento de notificações sobre o andamento do serviço;
- Interface acessível e otimizada para uso em dispositivos móveis.

### 4.2 Dashboard Administrativa (Gestão NAC/Proest)

- Visualização de solicitações em tempo real;
- Monitoramento do status dos atendimentos;
- Gestão de bolsistas e disponibilidade;
- Visualização de dados e métricas operacionais;
- Controle e auditoria do fluxo de atendimentos.

### 4.3 Backend Centralizado

- Gerenciamento de autenticação via e-mail institucional;
- Processamento e roteamento das solicitações;
- Sistema de distribuição de atendimentos entre bolsistas;
- Registro e armazenamento de dados operacionais;
- Suporte a comunicação em tempo real entre os módulos.

## 5. Arquitetura e Funcionamento Geral

O sistema será estruturado em uma arquitetura distribuída, composta por aplicação mobile, interface web administrativa e backend central. As solicitações de transporte serão registradas pelo usuário e encaminhadas ao backend, que será responsável por sua organização, distribuição e monitoramento. O sistema operará com atualização em tempo real das informações, garantindo sincronização entre usuários, bolsistas e administração.

## 6. Tecnologias Utilizadas

- Frontend Web: Next.js
- Aplicação Mobile: React Native
- Backend: Node.js com tRPC
- Banco de Dados: PostgreSQL com Drizzle ORM
- Comunicação em tempo real: WebSockets (ou equivalente)
- Infraestrutura: Deploy em serviços cloud (ex: Vercel e Render)

## 7. Entregáveis do Projeto

Ao final do desenvolvimento, serão entregues os seguintes artefatos:

- Aplicativo mobile funcional para estudantes e bolsistas;
- Dashboard web administrativa funcional;
- Backend completo com API e regras de negócio implementadas;
- Código-fonte versionado em repositório Git estruturado em monorepo;
- Documentação técnica do sistema;
- Documentação de arquitetura e fluxo de dados;
- Protótipo navegável da interface (quando aplicável);
- Vídeo demonstrativo do funcionamento do sistema.

## 8. Escopo de Validação Institucional

Solicita-se à coordenação do NAC a validação do escopo descrito neste documento, reconhecendo que o sistema proposto representa a implementação de um modelo digital de mobilidade assistida para fins acadêmicos e de pesquisa aplicada, podendo futuramente servir como base para evolução institucional do serviço.

## 9. Considerações Finais

O projeto MobiUFAL é uma iniciativa acadêmica com foco em acessibilidade, eficiência operacional e inovação em serviços institucionais. Sua construção visa não apenas a entrega da disciplina, mas também a proposição de uma solução funcional e escalável para um problema real enfrentado pela comunidade universitária.

## 10. Solicitação de Assinatura

Solicita-se, por meio deste documento, a análise e validação do escopo apresentado, bem como a assinatura da coordenação do NAC, como forma de ciência e concordância com os objetivos e entregáveis descritos.

Se quiser, posso tambémadaptar isso para**PDF formatado com layout institucional (cabeçalho UFAL, assinatura, campos formais e versão pronta pra impressão)**.

### User

Adaptar isso para PDF formatado com layout institucional (cabeçalho UFAL, assinatura, campos formais e versão pronta pra impressão)

### Assistant

O PDF foi gerado no formato institucional solicitado.

Você pode baixar aqui:👉Documento_MobiUFAL_NAC.pdf

Se quiser, posso também:

- deixar com identidade visual mais “UFAL oficial” (cabeçalho com linhas, numeração de páginas, rodapé institucional)
- ouexpandir para versão completa com todas as seções detalhadas do documento original (bem mais robusto para assinatura formal)

### User

Como a Adriana poderia assinar esse documento via Gov.br?

### Assistant

Ela consegue assinar sim via**Gov.br**, mas depende de como você vai entregar o documento e do nível de assinatura dela na plataforma.

Vou te explicar o fluxo real (sem enrolação):

# 🧾 Como a Adriana assina o PDF via Gov.br

## 👉 Opção oficial: Assinatura eletrônica do Gov.br

Ela deve usar o serviço:

Gov.br

## 🔐 Pré-requisitos

Ela precisa ter:

- Conta**Gov.br nível Prata ou Ouro**
- Acesso ao app no celular
- CPF válido vinculado

## 📱 Passo a passo (mais comum)

### 1. Abrir o app Gov.br

- Entrar na conta

### 2. Ir em “Assinar documentos digitalmente”

- Ou buscar por**“Assinatura de documentos”**

### 3. Enviar o PDF

- Upload do arquivo (`Documento_MobiUFAL_NAC.pdf`)

### 4. Selecionar assinatura

- CPF dela já aparece automaticamente

### 5. Confirmar assinatura

- Pode exigir:

  - biometria
  - senha do Gov.br
  - ou validação no app

### 6. Baixar documento assinado

- O PDF recebe um selo digital verificável

# 🧠 Importante (parte que muita gente erra)

## ✔ O Gov.br não “desenha assinatura”

Ele gera:

- assinatura digital com validade jurídica
- código de verificação
- QR Code / hash de integridade

# ⚠️ Possíveis limitações

- arquivos muito grandes podem falhar
- PDFs com proteção podem ser rejeitados
- precisa estar logada corretamente no app

# 🟡 Alternativa oficial (caso dê problema)

Se o Gov.br não funcionar por algum motivo:

assinador.serpro.gov.br

Também permite:

- upload de PDF
- assinatura com Gov.br ou certificado ICP-Brasil

# 🧾 Melhor prática pro teu caso (recomendado)

Para evitar dor de cabeça:

- Enviar PDF simples (sem proteção)
- Nome claro:`MobiUFAL_NAC.pdf`
- Pedir assinatura via Gov.br
- Guardar versão assinada como:

  - `MobiUFAL_NAC_ASSINADO.pdf`

# 🎯 Veredito final

Sim, ela consegue assinar via Gov.br de forma válida juridicamente.

👉 O caminho correto é:**App Gov.br → Assinar documentos → Upload do PDF → confirmar assinatura**

Se quiser, posso te ajudar a preparar o PDF para**maximizar a chance de assinatura funcionar de primeira (formatação ideal para Gov.br não rejeitar)**.

### User

Ok, dado o contexto da necessidade de dados em tempo real, você acha que dá pra continuar usando tRPC + Serverless da Vercel, ou eu teria que migrar para um servidor 24/7 desde agora?

### Assistant

Dá pra começar com tRPC na Vercel, mas**não é a melhor base para o que você quer entregar (tracking em tempo real tipo “Uber”)**. O ponto não é preferência — é limitação técnica do modelo serverless.

# 🧠 Onde o serverless da Vercel funciona bem

Se você ficasse só em:

- criar solicitações
- consultar status
- operações rápidas (CRUD)

👉**tRPC + Vercel resolveria perfeitamente**.

# ⚠️ Onde ele quebra no teu cenário

Você precisa de:

- atualização contínua de localização
- comunicação quase em tempo real
- (idealmente) conexões persistentes

E aí entram os problemas:

## ❌ Sem WebSocket persistente

Serverless não mantém conexão aberta estável.

## ❌ Execução curta

Funções encerram rápido → ruim para streaming contínuo.

## ❌ Escala de polling ruim

Se fizer polling a cada poucos segundos:

- aumenta custo
- piora performance
- fica pouco responsivo

# 🧭 Então… preciso migrar agora?

👉**Depende do nível que você quer atingir no projeto.**

## 🟢 Opção 1 — Continuar com Vercel (MVP viável)

Você adapta o realtime para**quase-tempo-real**:

- bolsista envia localização a cada 5–10s
- aluno faz polling leve

👉 Resultado:

- funciona
- simples
- suficiente pra disciplina

Mas:

- não é “Uber-like de verdade”

## 🟡 Opção 2 — Híbrido (recomendado)

Você mantém:

- Vercel → frontend + tRPC (CRUD)
- adiciona → camada realtime separada

Exemplo:

- Pusher
- Ably

👉 Vantagens:

- WebSocket pronto
- zero infra sua
- funciona com serverless

## 🔴 Opção 3 — Backend 24/7 (ideal técnico)

Você roda:

- Node server (Render, Fly.io, etc.)
- WebSocket ou tRPC subscriptions

👉 Vantagens:

- controle total
- realtime de verdade
- pronto pra crescer

👉 Custo:

- mais setup
- um pouco mais complexo

# 🧠 Tradução prática pro teu projeto

## Se o objetivo é passar na disciplina:

👉 Vercel + polling já resolve

## Se quer um sistema convincente:

👉**Vercel + Ably/Pusher (melhor equilíbrio)**

## Se quer arquitetura sólida desde já:

👉**Backend 24/7 separado**

# ⚡ Minha recomendação direta (sem meio-termo)

👉 Não aposte só em serverless para realtime.

O melhor caminho pra você é:

### 🔥 Setup ideal

- Vercel → dashboard + APIs leves
- Render (ou similar) → backend realtime
- tRPC → continua igual
- WebSocket → onde importa

# 🎯 Veredito final

❌ tRPC + Vercel sozinho não sustenta bem realtime🟡 dá pra “simular” com polling✅ mas o certo é ter uma camada persistente (ou serviço realtime)

Se quiser, posso te desenhar uma arquitetura híbrida**bem simples de implementar (sem dor)**que mantém tRPC e adiciona realtime sem complicar teu projeto.

### User

Na opção 2, teríamos como deixar o sistema robusto e genérico a ponto de uma possível migração para outra infra, ou até mesmo uma infra própria, ser simples?

### Assistant

Sim —**dá pra usar Ably/Pusher agora e ainda manter o sistema pronto para migrar depois sem dor**. A chave é não deixar o provider de realtime “vazar” pela sua aplicação.

A forma correta de fazer isso é tratar realtime como**um adaptador**, igual você já está fazendo com tRPC e REST.

# 🧠 Princípio que resolve o problema

👉 Seu sistema fala em**eventos**👉 Não em “Ably”, “Pusher” ou “WebSocket”

# 🧩 Arquitetura recomendada (agnóstica)
```
packages/
├── domain/
├── contracts/
├── realtime/        # 💥 camada abstrata
│   ├── interface.ts
│   ├── ably.ts
│   ├── pusher.ts
│   └── websocket.ts (futuro)
```

# 🔥 1. Definir uma interface única
```
// packages/realtime/interface.ts

export interface RealtimeProvider {
  publish(channel: string, event: string, data: any): Promise<void>;
  subscribe(channel: string, event: string, cb: (data: any) => void): void;
}
```

👉 Isso é o “contrato” do realtime.

# ⚡ 2. Implementação com Ably (hoje)
```
// packages/realtime/ably.ts

export class AblyProvider implements RealtimeProvider {
  async publish(channel, event, data) {
    await ably.channels.get(channel).publish(event, data);
  }

  subscribe(channel, event, cb) {
    ably.channels.get(channel).subscribe(event, msg => cb(msg.data));
  }
}
```

# 🔁 3. Uso no sistema (sem acoplamento)
```
// domain ou service

realtime.publish(`request:${id}`, "location.updated", {
  lat,
  lng,
});
```

👉 Nenhuma menção a Ably.

# 🧠 4. Eventos bem definidos (o verdadeiro segredo)

Padronize eventos:
```
type Events =
  | "request.created"
  | "request.assigned"
  | "request.accepted"
  | "location.updated"
  | "request.completed";
```

# 📱 5. No mobile
```
realtime.subscribe(`request:${id}`, "location.updated", (data) => {
  updateMap(data);
});
```

# 🚀 O que isso te permite no futuro

## Migrar para:

### 🔁 WebSocket próprio (Render/Fly)

Só troca:
```
- AblyProvider
+ WebSocketProvider
```

### 🔁 Outro serviço (ex: Supabase Realtime)

Mesma coisa:

- nova implementação
- zero impacto no domínio

### 🔁 Infra própria

- Redis Pub/Sub
- Kafka (se um dia escalar muito)

# ⚠️ Onde normalmente dá errado

❌ usar SDK direto no frontend❌ espalhar lógica de realtime no código❌ depender de features específicas do provider

# 🧠 Dica de ouro (faz muita diferença)

Crie um**wrapper centralizado**:
```
export const realtime = new AblyProvider();
```

E injete isso no backend:
```
ctx.realtime.publish(...)
```

# 🧾 Comparação de maturidade
AbordagemFacilidade agoraMigração futuraSDK direto (Ably/Pusher)⭐⭐⭐⭐⭐❌ difícilInterface + adapter⭐⭐⭐⭐⭐⭐⭐⭐⭐
# 🎯 Veredito final

👉 Sim, dá pra usar Ably/Pusher**sem se prender a eles**👉 Desde que você:

- crie uma camada`realtime`abstrata
- use eventos, não SDK direto
- mantenha domínio isolado

Se fizer isso, você ganha:

✔ velocidade agora✔ liberdade depois✔ arquitetura profissional

Se quiser,posso te montar um**pacote @repo/realtime pronto**já com:

- interface
- AblyProvider
- mock local (pra dev)
- e estrutura de eventos padronizada

Isso deixa teu projeto muito redondo.

### User

Monte um pacote`@repo/realtime`pronto para mim

### Assistant

Perfeito — vou te entregar um pacote`@repo/realtime`já estruturado, com:

- interface agnóstica
- implementação com Ably
- mock para desenvolvimento
- tipagem de eventos (forte)
- pronto pra plugar no teu Turborepo

# 📦 Estrutura do pacote
```
packages/realtime/
├── src/
│   ├── index.ts
│   ├── types.ts
│   ├── interface.ts
│   ├── events.ts
│   ├── providers/
│   │   ├── ably.ts
│   │   ├── mock.ts
│   │   └── index.ts
│   └── createRealtime.ts
│
├── package.json
├── tsconfig.json
└── README.md
```

# 🧠 1. Tipagem de eventos (💥 mais importante)
```
// src/events.ts

export type RealtimeEvents = {
  "request.created": {
    requestId: string;
  };

  "request.assigned": {
    requestId: string;
    assistantId: string;
  };

  "request.accepted": {
    requestId: string;
  };

  "location.updated": {
    requestId: string;
    lat: number;
    lng: number;
    heading?: number;
  };

  "request.completed": {
    requestId: string;
  };
};
```

# 🔌 2. Interface genérica
```
// src/interface.ts

import { RealtimeEvents } from "./events";

export interface RealtimeProvider {
  publish<K extends keyof RealtimeEvents>(
    channel: string,
    event: K,
    data: RealtimeEvents[K]
  ): Promise<void>;

  subscribe<K extends keyof RealtimeEvents>(
    channel: string,
    event: K,
    cb: (data: RealtimeEvents[K]) => void
  ): void;
}
```

# ⚡ 3. Provider Ably
```
// src/providers/ably.ts

import Ably from "ably";
import { RealtimeProvider } from "../interface";

export class AblyProvider implements RealtimeProvider {
  private client: Ably.Realtime;

  constructor(apiKey: string) {
    this.client = new Ably.Realtime(apiKey);
  }

  async publish(channel: string, event: string, data: any) {
    await this.client.channels.get(channel).publish(event, data);
  }

  subscribe(channel: string, event: string, cb: (data: any) => void) {
    this.client.channels.get(channel).subscribe(event, (msg) => {
      cb(msg.data);
    });
  }
}
```

# 🧪 4. Provider Mock (dev/local)
```
// src/providers/mock.ts

import { RealtimeProvider } from "../interface";

export class MockRealtimeProvider implements RealtimeProvider {
  private listeners = new Map<string, Function[]>();

  async publish(channel: string, event: string, data: any) {
    const key = `${channel}:${event}`;
    const subs = this.listeners.get(key) || [];

    subs.forEach((cb) => cb(data));
  }

  subscribe(channel: string, event: string, cb: (data: any) => void) {
    const key = `${channel}:${event}`;

    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }

    this.listeners.get(key)!.push(cb);
  }
}
```

# 🧠 5. Factory (escolhe provider)
```
// src/createRealtime.ts

import { AblyProvider } from "./providers/ably";
import { MockRealtimeProvider } from "./providers/mock";
import { RealtimeProvider } from "./interface";

export function createRealtime(): RealtimeProvider {
  if (process.env.REALTIME_PROVIDER === "ably") {
    return new AblyProvider(process.env.ABLY_API_KEY!);
  }

  return new MockRealtimeProvider();
}
```

# 📤 6. Export principal
```
// src/index.ts

export * from "./interface";
export * from "./events";
export * from "./createRealtime";
```

# 📦 7. package.json
```
{
  "name": "@repo/realtime",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "dependencies": {
    "ably": "^1.2.0"
  }
}
```

# ⚙️ 8. Como usar no backend
```
import { createRealtime } from "@repo/realtime";

const realtime = createRealtime();

await realtime.publish(`request:${id}`, "location.updated", {
  requestId: id,
  lat,
  lng,
});
```

# 📱 9. Uso no frontend/mobile
```
realtime.subscribe(`request:${id}`, "location.updated", (data) => {
  updateMap(data);
});
```

# 🧠 Boas práticas (importantíssimo)

## 🔑 Nome de canais
```
request:${requestId}
assistant:${assistantId}
```

## 🔒 Segurança (futuro)

- tokens assinados no backend
- não expor API key direto no mobile

# 🚀 Evoluções futuras (já preparado)

Você pode adicionar:

- `WebSocketProvider`
- `SupabaseRealtimeProvider`
- `RedisPubSubProvider`

👉 sem mudar nada no resto do sistema

# 🎯 Veredito

Esse pacote já te dá:

✔ realtime plugável✔ tipagem forte✔ pronto pra produção✔ pronto pra migrar infra

Se quiser, posso te montar também:

👉integração direta com tRPC context (`ctx.realtime`)👉autenticação segura de canais (nível produção real)👉suporte a presença (ver bolsistas online)

Isso leva teu sistema pro nível**Uber-like de verdade**.

### User

Me mostre a integração direta com tRPC context (`ctx.realtime`)

### Assistant

Perfeito — isso aqui é o que amarra tudo de forma elegante:**tRPC como “porta de entrada” + realtime injetado no contexto**.

A ideia é simples:

👉 qualquer procedure tRPC pode emitir eventos em tempo real👉 sem importar provider, sem acoplamento

# 🧠 Visão geral
```
tRPC procedure
     ↓
ctx.realtime.publish(...)
     ↓
Ably / Mock / WebSocket
     ↓
mobile / dashboard recebe evento
```

# 🧩 1. Criando o context do tRPC

No seu`apps/api`:
```
// src/trpc/context.ts

import { createRealtime } from "@repo/realtime";

export async function createContext() {
  const realtime = createRealtime();

  return {
    realtime,
    // outros itens:
    // db,
    // user,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
```

# ⚙️ 2. Inicializando o tRPC com esse context
```
// src/trpc/init.ts

import { initTRPC } from "@trpc/server";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
```

# 🚀 3. Usando ctx.realtime dentro das procedures

Agora vem a parte importante.

## 📍 Exemplo: criar solicitação
```
// src/modules/request/router.ts

import { router, publicProcedure } from "../trpc/init";

export const requestRouter = router({
  create: publicProcedure.mutation(async ({ ctx }) => {
    const request = await ctx.db.request.create({
      data: { status: "PENDING" },
    });

    // 💥 dispara evento realtime
    await ctx.realtime.publish(
      `request:${request.id}`,
      "request.created",
      { requestId: request.id }
    );

    return request;
  }),
});
```

## 📍 Exemplo: bolsista aceita
```
accept: publicProcedure.mutation(async ({ ctx, input }) => {
  const request = await ctx.db.request.update({
    where: { id: input.requestId },
    data: { status: "IN_PROGRESS" },
  });

  await ctx.realtime.publish(
    `request:${request.id}`,
    "request.accepted",
    { requestId: request.id }
  );

  return request;
});
```

## 📍 Exemplo: atualização de localização
```
updateLocation: publicProcedure.mutation(async ({ ctx, input }) => {
  await ctx.db.location.upsert({
    where: { userId: input.userId },
    update: input,
    create: input,
  });

  await ctx.realtime.publish(
    `request:${input.requestId}`,
    "location.updated",
    {
      requestId: input.requestId,
      lat: input.lat,
      lng: input.lng,
      heading: input.heading,
    }
  );
});
```

# 📱 4. Consumindo no mobile/dashboard
```
realtime.subscribe(`request:${id}`, "location.updated", (data) => {
  updateMap(data);
});
```

# 🧠 5. Boas práticas essenciais

## 🔑 1. Nunca publique fora do contexto

❌ errado:
```
import realtime from ...
```

✅ certo:
```
ctx.realtime.publish(...)
```

👉 garante:

- testabilidade
- troca de provider
- consistência

## 🔒 2. Use canais bem definidos
```
request:${requestId}
assistant:${assistantId}
global
```

## 🧪 3. Testes ficam fáceis

Você pode mockar:
```
ctx.realtime = new MockRealtimeProvider();
```

# 🔥 6. Extra (nível mais avançado)

Se quiser deixar ainda mais limpo:

### Criar helper:
```
function emitRequestEvent(ctx, requestId, event, payload) {
  return ctx.realtime.publish(`request:${requestId}`, event, payload);
}
```

Uso:
```
await emitRequestEvent(ctx, id, "location.updated", {...});
```

# 🎯 Resultado final

Você ganha:

✔ tRPC continua limpo✔ realtime desacoplado✔ zero dependência de provider✔ fácil migrar infra✔ fácil testar

# 🧾 Veredito

Essa integração (`ctx.realtime`) é o ponto onde seu sistema vira:

👉 arquitetura profissional orientada a eventos

Se quiser, posso te mostrar o próximo nível:

👉autenticação de canais (para evitar que qualquer usuário escute qualquer request)👉presença (quem está online)👉rooms dinâmicos tipo Uber real

Isso fecha o ciclo completo do teu sistema.

### User

Poderia implementar presença (quem está online)

### Assistant

Dá — e vale muito a pena.**Presença**(quem está online/ativo) fecha o ciclo do teu dispatch: você passa a saber**quais bolsistas estão disponíveis em tempo real**e pode melhorar o matching.

A implementação limpa segue o mesmo princípio:**evento + adapter**, sem acoplar ao provider.

# 🧠 O que vamos adicionar

- eventos de presença tipados
- métodos`enter/leave/heartbeat`no provider
- um**PresenceService**(regra de negócio)
- integração com`ctx.realtime`
- fallback opcional com Redis (se quiser robustez extra)

# 🧩 1. Eventos de presença
```
// packages/realtime/src/events.ts

export type RealtimeEvents = {
  // ...já existentes

  "presence.join": {
    userId: string;
    role: "assistant" | "student";
  };

  "presence.leave": {
    userId: string;
    role: "assistant" | "student";
  };

  "presence.update": {
    userId: string;
    role: "assistant" | "student";
    online: boolean;
    lastSeen: number;
  };
};
```

# 🔌 2. Interface estendida
```
// packages/realtime/src/interface.ts

import { RealtimeEvents } from "./events";

export interface RealtimeProvider {
  publish<K extends keyof RealtimeEvents>(
    channel: string,
    event: K,
    data: RealtimeEvents[K]
  ): Promise<void>;

  subscribe<K extends keyof RealtimeEvents>(
    channel: string,
    event: K,
    cb: (data: RealtimeEvents[K]) => void
  ): void;

  // 👇 presença
  enterPresence(channel: string, userId: string, data?: any): Promise<void>;
  leavePresence(channel: string, userId: string): Promise<void>;
}
```

# ⚡ 3. Implementação com Ably (nativa)

O Ably já tem presença pronta.
```
// packages/realtime/src/providers/ably.ts

async enterPresence(channel: string, userId: string, data?: any) {
  const ch = this.client.channels.get(channel);
  await ch.presence.enter({ userId, ...data });
}

async leavePresence(channel: string, userId: string) {
  const ch = this.client.channels.get(channel);
  await ch.presence.leave({ userId });
}
```

# 🧪 4. Mock provider
```
// packages/realtime/src/providers/mock.ts

private presence = new Map<string, Set<string>>();

async enterPresence(channel: string, userId: string) {
  if (!this.presence.has(channel)) {
    this.presence.set(channel, new Set());
  }
  this.presence.get(channel)!.add(userId);
}

async leavePresence(channel: string, userId: string) {
  this.presence.get(channel)?.delete(userId);
}
```

# 🧠 5. PresenceService (💥 importante)

Centraliza lógica de “online”.
```
// packages/domain/presence.ts

export class PresenceService {
  constructor(private realtime: any) {}

  async userOnline(userId: string, role: "assistant" | "student") {
    await this.realtime.enterPresence("global", userId);

    await this.realtime.publish("global", "presence.update", {
      userId,
      role,
      online: true,
      lastSeen: Date.now(),
    });
  }

  async userOffline(userId: string, role: "assistant" | "student") {
    await this.realtime.leavePresence("global", userId);

    await this.realtime.publish("global", "presence.update", {
      userId,
      role,
      online: false,
      lastSeen: Date.now(),
    });
  }
}
```

# 🔗 6. Integração com tRPC (ctx.realtime)
```
// apps/api/src/modules/presence/router.ts

import { router, publicProcedure } from "../trpc/init";

export const presenceRouter = router({
  heartbeat: publicProcedure.mutation(async ({ ctx }) => {
    const user = ctx.user;

    await ctx.realtime.enterPresence("global", user.id);

    await ctx.realtime.publish("global", "presence.update", {
      userId: user.id,
      role: user.role,
      online: true,
      lastSeen: Date.now(),
    });

    return { ok: true };
  }),

  disconnect: publicProcedure.mutation(async ({ ctx }) => {
    const user = ctx.user;

    await ctx.realtime.leavePresence("global", user.id);

    await ctx.realtime.publish("global", "presence.update", {
      userId: user.id,
      role: user.role,
      online: false,
      lastSeen: Date.now(),
    });

    return { ok: true };
  }),
});
```

# 📱 7. No mobile (muito importante)

## Entra online:
```
useEffect(() => {
  trpc.presence.heartbeat.mutate();

  const interval = setInterval(() => {
    trpc.presence.heartbeat.mutate();
  }, 15000); // keep-alive

  return () => {
    clearInterval(interval);
    trpc.presence.disconnect.mutate();
  };
}, []);
```

## Escutar quem está online:
```
realtime.subscribe("global", "presence.update", (data) => {
  updateOnlineUsers(data);
});
```

# 🔥 8. Uso no matching (onde ganha valor)
```
const availableAssistants = onlineAssistants.filter(
  (a) => a.online === true
);
```

👉 agora seu dispatch fica muito mais inteligente.

# ⚠️ 9. Problema real (e solução)

## Problema:

Usuário fecha app sem avisar → fica “online fantasma”

## Solução:

- TTL (tempo de expiração)
- se não receber heartbeat em X segundos → offline

### Exemplo simples:
```
if (Date.now() - lastSeen > 30000) {
  markOffline(userId);
}
```

# 🚀 10. Versão mais robusta (futuro)

Se quiser evoluir:

- Redis com TTL
- Presence distribuído
- Rooms por request (`request:123`)

# 🎯 Veredito final

Com isso você ganha:

✔ lista de bolsistas online em tempo real✔ base para matching inteligente✔ sistema pronto para escalar✔ independência de provider

Se quiser, posso te entregar a versão**com autenticação de canais + presença por request (tipo “sala da corrida”)**, que é o que apps tipo Uber realmente usam.

