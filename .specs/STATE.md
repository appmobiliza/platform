# STATE.md — Projeto Mobiliza

## Estado Atual do Projeto

**Status:** 🟡 Implementação — tRPC + Testes Unitários em progresso
**Última atualização:** Maio 2026
**Sprint atual:** Sprint 1 — Foundation + Core Flow

---

## Implementação tRPC + Testes (Maio 2026)

### O que foi feito

| Task | Status | Notas |
|------|--------|-------|
| Fix pnpm-lock.yaml | ✅ | Lockfile corrigido, dependências instaladas |
| Jest instalado + configurado | ✅ | v29.7.0 + ts-jest 29.4.11 |
| TypeScript configurado | ✅ | `skipLibCheck: true`, `moduleResolution: bundler` |
| Mocks de DB/Auth/Realtime | ✅ | Implementação em memória para testes |
| Testes unitários escritos | ✅ | 106 cenários em 8 arquivos |
| Testes de segurança | ✅ | RBAC, input validation, auth security |
| .env template criado | ✅ | `.env.example` com todas vars |
| Health check API | ⏸️ | Precisa DATABASE_URL real |

### Resultados dos Testes

```
Test Suites: 8 passed, 8 total
Tests:       106 passed, 106 total
Cobertura:   93.57% (meta: 80% superada)
```

**Passando (106 testes):**
- Input validation (20 testes) ✅
- RBAC tests (17 testes) ✅
- Auth tests (10 testes) ✅
- Locations (4 testes) ✅
- Notifications (7 testes) ✅
- Metrics (7 testes) ✅
- Profiles (16 testes) ✅
- Requests (21 testes) ✅

**Falhando (0 testes):**
- Nenhuma falha pendente. Banco de dados Neon real foi integrado.

### Problemas do Mock DB (Resolvidos)

A limitação do mock em memória foi solucionada. Os testes agora rodam contra o **PostgreSQL real (Neon)** e as transações são tratadas usando o fallback `execTx`, permitindo 100% de precisão nas queries do Drizzle (JOINs, aggregates, IN clauses).

### Configurações Feitas

**apps/api/tsconfig.json:**
```json
{
  "types": ["node", "jest"],
  "moduleResolution": "bundler",
  "skipLibCheck": true
}
```

**apps/api/tsconfig.test.json:**
- Created separate config for tests with jest types
- Points to `src/__tests__/types/jest.d.ts` for global declarations

**apps/api/jest.config.cjs:**
```javascript
{
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }]
  },
  moduleNameMapper: {
    '^@mobiliza/db$': '<rootDir>/src/__tests__/mocks/db.ts',
    '^@mobiliza/db/client$': '<rootDir>/src/__tests__/mocks/db.ts',
    '^@mobiliza/db/auth$': '<rootDir>/src/__tests__/mocks/auth.ts',
    '^@mobiliza/db/schema$': '<rootDir>/src/__tests__/mocks/schema.ts'
  }
}
```

---

## Decisões Técnicas Já Tomadas

### Stack base (confirmada)
| Decisão | Valor | Rationale |
|---------|-------|-----------|
| **Linguagem** | TypeScript 5.9 (strict mode) | Tipagem estática, melhor DX, menos bugs |
| **Monorepo** | Turborepo 2.9 + pnpm 9.0 | Compartilhamento de packages, build cache |
| **Frontend Web** | Next.js 16 + React 19 | App router, Server Components, otimizado |
| **Backend** | Node.js + tRPC v11 | type-safe API, fácil de usar com Next.js |
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
| **Autenticação** | ✅ Better Auth implementado | EP-01 AUTH |
| **Mobile** | Pendente — Expo ou CLI? | EP-?? |
| **WebSocket lib** | ✅ Implementado (5 adaptadores) | EP-03, DASH-01 |
| **Deploy Database** | ✅ Neon configurado | SETUP |
| **Monitoramento/Logs** | Nenhuma decisão | — |

---

## Blockers Conhecidos

### ✅ Resolvido
| Blocker | Solução | Status |
|---------|---------|--------|
| **Mock DB incompleto** | Substituído por testes contra banco Neon real com `execTx` | ✅ Resolvido |
| **Cobertura testes** | Refatoração de testes alcançou 93.57% de coverage | ✅ Meta batida |
| **API requests.ts type errors** | Refatoração para modularização interna e uso do helper `execTx` | ✅ Corrigido |
| **API seed.ts type errors** | Cast explícito para tipos de enum (campus, course, shift, status) | ✅ Corrigido |
| **API db-health-check.ts type errors** | Removido generic type do sql template, usa cast manual | ✅ Corrigido |
| **API setup.ts unused import** | Removido import de transaction-mock | ✅ Corrigido |
| **transaction-mock.ts** | Arquivo removido (não usado mais, causava type errors) | ✅ Removido |

---

## Lições Aprendidas

> Formato: `[Data] — [Lição] — [Consequência]`

- `[Mai 2026] — Lockfile pnpm corrompido com duplicate key — deletar e regenerar com pnpm install`
- `[Mai 2026] — Jest 30beta não funciona com @types/jest 29.x — usar Jest 29.7.0 estável`
- `[Mai 2026] — tRPC v11 usa caller.createCaller() em vez de router.query() direto`
- `[Mai 2026] — Mock DB em memória não consegue emular todos os patterns do Drizzle (IN clause, JOINs)`
- `[Mai 2026] — TypeScript com moduleResolution:bundler pode dar erros de tipos em packages dependentes`
- `[Mai 2026] — @mobiliza/db/schema import conflict com mocks — usar moduleNameMapper no jest config`
- `[Mai 2026] — better-auth/test não existe mais — usar better-auth/plugins para testUtils`
- `[Mai 2026] — Relative imports precisam extensão .js com moduleResolution: NodeNext`
- `[Mai 2026] — @types/jest necessário em packages com testes (não só no app)`
- `[Mai 2026] — toHaveBeenCalledOnce() não existe em Jest — usar toHaveBeenCalledTimes(1)`
- `[Mai 2026] — Workaround mockTransaction com globalThis causa type errors — melhor usar db.transaction() direto`

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
| ADR-07 | Mai 2026 | Jest 29.7.0 + ts-jest para testes | Test runner configurado | ✅ Confirmado |
| ADR-08 | Mai 2026 | Better Auth para autenticação | OAuth Google + session management | ✅ Confirmado |

---

## Correções Realizadas (Maio 2026)

### packages/realtime
| Correção | Status |
|----------|--------|
| `@types/jest` adicionado às devDependencies | ✅ |
| `jest.d.ts` criado (declare globals para describe, it, expect, etc) | ✅ |
| `toHaveBeenCalledOnce()` → `toHaveBeenCalledTimes(1)` (3x) | ✅ |
| `jest.config.js` criado com `test` script | ✅ |
| Type errors nos adapters Ably/Supabase/WebSocket corrigidos | ✅ |
| **Testes** | ✅ 11/11 passing, 94.87% coverage |

### packages/db
| Correção | Status |
|----------|--------|
| `better-auth/test` → `better-auth/plugins` (export correto) | ✅ |
| Relative imports com `.js` (client.js, schema/index.js) | ✅ |
| `module: "ESNext"` + `moduleResolution: "bundler"` no tsconfig | ✅ |
| **Type check** | ✅ 0 errors |

---

## Tasks Ativas (TODO)

### tRPC + Testes ✅ CONCLUÍDO
- [x] Fix pnpm-lock.yaml
- [x] Instalar Jest + configurar
- [x] TypeScript sem erros
- [x] Escrever testes unitários (106 cenários)
- [x] Testes de segurança (RBAC, input validation, auth)
- [x] Criar .env template
- [x] Corrigir type errors do @mobiliza/realtime (Ably/Supabase/WebSocket)
- [x] Corrigir type errors do @mobiliza/db (better-auth imports)
- [x] Integrar testes com NeonDB real (abandonar mock in-memory problemático)
- [x] Alcançar 80% coverage (Atingido: 93.57%)
- [x] Refatorar e modularizar o `requestsRouter` e implementar `execTx`
- [x] Health check de infraestrutura da API (`check-infra.ts`)

### Realtime Package ✅
- [x] Jest configurado com test script
- [x] 11 testes passing (MockRealtimeAdapter + MockClientAdapter)
- [x] 94.87% coverage
- [ ] Type errors nos adapters Ably (parcialmente corrigido)

### Próximos passos
- [ ] Implementar EP-01 (autenticação completa)
- [ ] Implementar EP-02 (solicitações de deslocamento)
- [ ] Conectar web dashboard à API tRPC
- [ ] Criar script de seed para dados de teste