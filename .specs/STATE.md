# STATE.md — Projeto Mobiliza

## Estado Atual do Projeto

**Status:** 🟡 Inicializando — Ambiente setupado, documentação em construção
**Última atualização:** Maio 2026
**Sprint atual:** Não iniciada (em fase de planejamento/docs)

---

## Decisões Técnicas Já Tomadas

### Stack base (confirmada)
| Decisão | Valor | Rationale |
|---------|-------|-----------|
| **Linguagem** | TypeScript 5.9 (strict mode) | Tipagem estática, melhor DX, menos bugs |
| **Monorepo** | Turborepo 2.9 + pnpm 9.0 | Compartilhamento de packages, build cache |
| **Frontend Web** | Next.js 16 + React 19 | App router, Server Components, otimizado |
| **Backend** | Node.js + tRPC v11 |type-safe API, fácil de usar com Next.js |
| **Banco de Dados** | PostgreSQL + Drizzle ORM | Relational integrity, Neon for serverless |
| **Validação** | Zod 3.25 | Schema validation, inferência de tipos |
| **Estilização** | TailwindCSS v4 | Utility-first, consistente com design system |
| **Linting** | ESLint 9 + Prettier 3.7 | Code quality, padronização |

### Arquitetura (confirmada)
| Decisão | Valor | Rationale |
|---------|-------|-----------|
| **Padrão** | Clean Architecture | contracts → domain → api (nunca inverter) |
| **Packages** | contracts, db, domain, realtime, ui | Separação clara de responsabilidades |
| **Real-time** | WebSockets (detalhes pendentes) | Sincronização entre app e dashboard |
| **Infra** | Vercel (web) + Render (API) | Cloud deployment |

### Ainda NÃO decidido
| Item | Status | Bloqueia |
|------|--------|----------|
| **Autenticação** | Pendente — usar NextAuth ou construir custom? | EP-01 AUTH |
| **Mobile** | Pendente — Expo ou CLI? React Native? | EP-?? |
| **WebSocket lib** | Pendente — ws, socket.io, graphql subscriptions? | EP-03, DASH-01 |
| **Deploy Database** | Pendente — Neon ou PostgreSQL local? | SETUP |
| **Monitoramento/Logs** | Nenhuma decisão | — |

---

## Blockers Conhecidos

### 🔴 Alto Impacto
| Blocker | Descrição | Solução Proposta |
|---------|-----------|------------------|
| **Nenhuma decisão sobre autenticação** | Sem auth, não há como começar EP-01 | Definir: NextAuth v5 + credentials provider + email UFAL simulado |
| **Mobile stack não definida** | App mobile é parte central do escopo mas está em branco | Priorizar web app primeiro; mobile como Sprint 3-4 |

### 🟡 Médio Impacto
| Blocker | Descrição | Solução Proposta |
|---------|-----------|------------------|
| **WebSocket não implementado** | Realtime é dependência critical para DASH-01 e AVAIL-01 | Definir lib + usar polling como fallback |
| ** Schema do banco incompleto** | Drizzle schema existe mas precisa de validação | Revisar schema com base nas US do backlog |

### 🟢 Baixo Impacto
| Blocker | Descrição |
|---------|-----------|
| **Design system não consolidado** | UI package tem button/card básicos, sem design final |
| **Sem ambiente de staging** | Apenas dev local |

---

## Lições Aprendidas (ainda em branco — será preenchido com experiência)

> Formato: `[Data] — [Lição] — [Consequência]`

Este espaço será preenchido conforme o projeto avança. Lições iniciais:

- `[Início] — Monorepo Turborepo precisa de config cuidadosa — evitar mudanças bruscas nos package.json`
- `[Início] — tRPC v11 tem diferenças de v10 — verificar documentação ao configurar routers`

---

## Histórico de Decisões (ADR)

| ID | Data | Decisão | Rationale | Status |
|----|------|---------|-----------|--------|
| ADR-01 | Mai 2026 | TypeScript strict mode | Segurança de tipos | ✅ Confirmado |
| ADR-02 | Mai 2026 | Turborepo + pnpm | Build cache, workspaces | ✅ Confirmado |
| ADR-03 | Mai 2026 | Next.js 16 (App Router) | React Server Components | ✅ Confirmado |
| ADR-04 | Mai 2026 | tRPC v11 | type-safe API | ✅ Confirmado |
| ADR-05 | Mai 2026 | Drizzle ORM + PostgreSQL/Neon | Relational + serverless | ✅ Confirmado |
| ADR-06 | Mai 2026 | Clean Architecture: contracts→domain→api | Separation of concerns | ✅ Confirmado |

---

## Tasks Ativas (TODO)

### Antes de começar Sprint 1
- [ ] Decidir provider de autenticação (NextAuth vs custom)
- [ ] Definir lib de WebSockets
- [ ] Validar schema Drizzle com as 18 user stories
- [ ] Revisar DESIGN.md do Figma com specs de tela

### Setup técnico
- [ ] Configurar variáveis de ambiente (DATABASE_URL, etc.)
- [ ] Criar script de seed para dados de teste
- [ ] Documentar convenções de commit no CONTRIBUTING.md

---

## Nota sobre Estado Inicial

Este projeto está em **fase de planejamento e documentação**. O código existente (`apps/api`, `packages/db`, `packages/domain`) representa um esqueleto técnico inicial — ainda não implementa regras de negócio das user stories.

O foco atual é:
1. ✅ Consolidar specs (este diretório `.specs/`)
2. ⬜ Definir decisões técnicas pendentes (auth, websockets)
3. ⬜ Implementar EP-01 (autenticação) como primeiro bloco funcional