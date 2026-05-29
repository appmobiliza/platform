# @mobiliza/api

Servidor HTTP do Mobiliza — **Hono + tRPC + Better Auth**.

---

## Stack e por quê

| Camada | Escolha | Razão |
|--------|---------|-------|
| HTTP | **Hono** | Leve, edge-ready, adaptador tRPC oficial |
| API tipada | **tRPC v11** | Tipagem end-to-end com React Native e Next.js sem codegen |
| Autenticação | **Better Auth** | Integração nativa com Drizzle + PostgreSQL, OAuth pronto |
| Realtime | **@mobiliza/realtime** | Agnóstico de provedor — Supabase para a apresentação |
| Banco | **@mobiliza/db** (Drizzle) | Queries tipadas, sem ORM pesado |

---

## Estrutura

```
packages/api/
  src/
    index.ts              → Bootstrap do servidor Hono
    router.ts             → Root router (agrega todos os sub-routers)
    trpc/
      context.ts          → TRPCContext, createTRPCContext, procedures base
    routers/
      requests.ts         → Solicitações de deslocamento (fluxo principal)
      profiles.ts         → Onboarding, aprovação de bolsistas
      locations.ts        → Locais do campus
      notifications.ts    → Notificações do usuário
      metrics.ts          → Dashboard do gestor NAC
```

---

## Rotas HTTP

| Método | Caminho | Descrição |
|--------|---------|-----------|
| `GET` | `/health` | Health check — sem autenticação |
| `GET/POST` | `/api/auth/*` | Better Auth — login, OAuth, sessão |
| `GET/POST` | `/trpc/*` | tRPC — todas as operações do domínio |

---

## Procedures do tRPC

### `requests.*`
| Procedure | Tipo | Role | Descrição |
|-----------|------|------|-----------|
| `requests.create` | mutation | student | Cria nova solicitação |
| `requests.cancel` | mutation | student | Cancela solicitação pendente |
| `requests.accept` | mutation | scholar | Bolsista aceita solicitação |
| `requests.start` | mutation | scholar | Inicia o deslocamento |
| `requests.complete` | mutation | scholar | Conclui o deslocamento |
| `requests.rate` | mutation | student | Avalia o atendimento (1-5) |
| `requests.myHistory` | query | any | Histórico paginado |
| `requests.available` | query | scholar | Solicitações disponíveis |
| `requests.managerList` | query | manager | Lista solicitações com relações para o dashboard web |

### `profiles.*`
| Procedure | Tipo | Role | Descrição |
|-----------|------|------|-----------|
| `profiles.me` | query | any | Perfil do usuário autenticado |
| `profiles.createStudent` | mutation | any | Onboarding estudante |
| `profiles.createScholar` | mutation | any | Onboarding bolsista |
| `profiles.toggleAvailability` | mutation | scholar | Liga/desliga disponibilidade |
| `profiles.pendingScholars` | query | manager | Bolsistas aguardando aprovação |
| `profiles.reviewScholar` | mutation | manager | Aprova ou rejeita bolsista |
| `profiles.scholarDashboard` | query | manager | Lista bolsistas com status operacional |
| `profiles.studentDashboard` | query | manager | Lista estudantes com resumo operacional |

### `locations.*`
| Procedure | Tipo | Role | Descrição |
|-----------|------|------|-----------|
| `locations.list` | query | público | Locais ativos |
| `locations.listAll` | query | manager | Todos os locais |
| `locations.create` | mutation | manager | Cadastra novo local |
| `locations.setActive` | mutation | manager | Ativa/desativa local |

### `notifications.*`
| Procedure | Tipo | Role | Descrição |
|-----------|------|------|-----------|
| `notifications.list` | query | any | Lista notificações |
| `notifications.markRead` | mutation | any | Marca como lida(s) |
| `notifications.unreadCount` | query | any | Contagem de não lidas |

### `metrics.*` (gestor NAC)
| Procedure | Tipo | Role | Descrição |
|-----------|------|------|-----------|
| `metrics.summary` | query | manager | Totais do período |
| `metrics.byOriginLocation` | query | manager | Demanda por local |
| `metrics.scholarPerformance` | query | manager | Performance dos bolsistas |

---

## Hierarquia de autorizações

```
publicProcedure      → qualquer um, sem sessão
protectedProcedure   → sessão válida (role: student | scholar | manager)
scholarProcedure     → role === "scholar"
managerProcedure     → role === "manager"
```

O role é lido diretamente da sessão do Better Auth — sem query adicional
ao banco por requisição.

---

## Fluxo de realtime

Cada transição de status publica um evento no canal correspondente:

```
request:{id}  → eventos de uma solicitação específica
  request:accepted  → bolsista aceitou
  request:started   → deslocamento iniciado
  request:completed → deslocamento concluído
  request:cancelled → cancelada pelo estudante

requests:available  → canal global de bolsistas
  request:new       → nova solicitação disponível

user:{userId}  → canal pessoal
  scholar:approved  → bolsista aprovado pelo NAC
  scholar:rejected  → bolsista rejeitado
```

O cliente React Native / Next.js escuta esses canais via
`@mobiliza/realtime` (adaptadores client-side).

---

## Como rodar

```bash
# Instalar dependências
pnpm install

# Copiar .env
cp .env.example .env
# Preencha DATABASE_URL, BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID/SECRET,
# SUPABASE_URL, SUPABASE_ANON_KEY

# Desenvolvimento com hot reload
pnpm dev

# Build de produção
pnpm build && pnpm start
```

---

## Uso no cliente (React Native / Next.js)

```typescript
// packages/mobile/src/lib/trpc.ts
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@mobiliza/api'

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: process.env.EXPO_PUBLIC_API_URL + '/trpc',
      // Cookies de sessão do Better Auth
      fetch: (url, options) => fetch(url, { ...options, credentials: 'include' }),
    }),
  ],
})

// Uso em um componente:
const locations = await trpc.locations.list.query()
await trpc.requests.create.mutate({
  originLocationId: 1,
  destinationLocationId: 3,
  notes: 'Estou na entrada principal',
})
```

---

## Próximos passos

- [ ] Adicionar router `audio` para upload de mensagens de voz
- [ ] Implementar `favoriteRoutes` no router de perfis
- [ ] Adicionar `scholar_shift` (turnos com horários) ao router de perfis  
- [ ] Background job para expirar solicitações `pending` → `unattended`
- [ ] Testes de integração com `MockRealtimeAdapter`
