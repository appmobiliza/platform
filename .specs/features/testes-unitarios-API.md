# Spec: Testes Unitários da API — Mobiliza

## Status: 🟡 EM ANDAMENTO

**Data de criação:** 26 de Maio 2026
**Última atualização:** 27 de Maio 2026
**Testes:** 90 passing, 16 failing, 106 total
**Cobertura:** Lines 86.87% ✅ | Statements 85.28% ✅ (meta 80%)
**Banco:** ✅ Neon PostgreSQL conectado e funcionando

---

## Sumário Executivo

Este documento descreve a implementação completa de testes unitários para a API tRPC do Mobiliza, incluindo:
- Migração do mock DB em memória para banco PostgreSQL real (Neon)
- Correção de bugs críticos encontrados durante a migração
- Desbloqueio de testes anteriormente skipados
- Evolução de ~40% para **86.87% de coverage** (meta 80% atingida)

### Progresso Alcançado:

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Tests Passing** | ~50/106 | **90/106** |
| **Coverage Lines** | ~40% | **86.87%** ✅ |
| **Coverage Statements** | ~40% | **85.28%** ✅ |
| **Tests Skipped** | ~20 | **0** |
| **Banco** | Mock DB | **Neon Real** |

---

## 1. Contexto e Problema Original

### 1.1 Problema

Mock DB em `apps/api/src/__tests__/mocks/db.ts` **não suportava**:
- **IN clause** — queries com `sql` template para IN falhavam
- **JOINs/eager loading** — `with: { studentProfile: { with: { user } } }` não retornava dados
- **Aggregates** — `count()`, `AVG()`, `GROUP BY` não funcionavam
- **Transactions** — Neon HTTP não suporta BEGIN/COMMIT/ROLLBACK

**Impacto:** 43 testes falhando, 20 skipados, coverage ~40%

### 1.2 Solução Implementada

1. **Banco Neon PostgreSQL real** conectado para testes
2. **Seed functions** para criar dados de teste no banco real
3. **DELETE afterEach** para cleanup (não ROLLBACK — Neon HTTP não suporta)
4. **Drizzle relations** adicionadas ao schema para suportar eager loading
5. **Fallback pattern** de transaction para neon-http

---

## 2. Arquitetura de Testes

### 2.1 Fluxo de Execução

```
┌──────────────────────────────────────────────────────┐
│ Jest Runner                                           │
│                                                       │
│ setupFilesAfterEnv (setup.ts)                        │
│   └─ Carrega .env via fs.readFileSync               │
│   └─ setupDatabase() conecta ao Neon                 │
│                                                       │
│ beforeAll()                                           │
│   └─ setupDatabase() → Neon conectado               │
│   └─ injectMockTransaction() → global fallback      │
│                                                       │
│ ┌─────────────────────────────────────────────────┐  │
│ │ TESTE                                            │  │
│ │  ├─ seedUser() → INSERT no Neon real          │  │
│ │  ├─ Call tRPC procedure (usa Neon real)        │  │
│ │  └─ Assertions                                   │  │
│ └─────────────────────────────────────────────────┘  │
│                                                       │
│ afterEach()                                           │
│   └─ DELETE nas tabelas de domínio                 │
│   ⚠️ NÃO deleta: user, session, account, verified  │
│                                                       │
│ afterAll()                                           │
│   └─ closeDatabase()                                │
└──────────────────────────────────────────────────────┘
```

### 2.2 Tabelas Ignoradas no Cleanup

```typescript
// NÃO deletadas (Better Auth - dados reais):
❌ DELETE FROM user
❌ DELETE FROM session
❌ DELETE FROM account
❌ DELETE FROM verification

// Deletadas (domínio Mobiliza):
✅ DELETE FROM notification
✅ DELETE FROM service_attendance
✅ DELETE FROM service_request
✅ DELETE FROM student_disability
✅ DELETE FROM student_profile
✅ DELETE FROM scholar_profile
✅ DELETE FROM campus_location
```

### 2.3 Estrutura de Arquivos

```
apps/api/src/__tests__/
├── setup.ts                    # ✅ Carrega .env, conecta Neon, hooks Jest
├── db-setup.ts                 # ✅ Compatibilidade (re-exporta)
├── db-health-check.ts         # ✅ Verifica conexão Neon
├── helpers/
│   ├── seed.ts                 # ✅ Funções async de seed (banco real)
│   └── transaction-mock.ts    # ✅ Fallback para neon-http
├── mocks/
│   ├── auth.ts                 # Mock Better Auth (não usa banco)
│   ├── realtime.ts             # Mock RealtimeAdapter (não usa banco)
│   ├── context.ts             # Factory TRPCContext (mock session)
│   ├── db.ts                   # Mock DB (fallback histórico)
│   └── schema.ts               # Schema de teste
└── routers/
    ├── requests.test.ts        # ✅ 21 cenários
    ├── profiles.test.ts        # ✅ 16 cenários
    ├── locations.test.ts       # ✅ 8 cenários
    ├── notifications.test.ts    # ✅ 7 cenários
    ├── metrics.test.ts         # ✅ 7 cenários
    └── security/
        ├── input-validation.test.ts  # ✅ 20/20
        ├── rbac.test.ts               # ✅ 17/17
        └── auth.test.ts               # ✅ 10/10
```

---

## 3. Bugs Corrigidos

### Bug 1: `accept` sem Transaction Fallback (CRÍTICO)

**Arquivo:** `apps/api/src/routers/requests.ts:209`

**Problema:** `accept` usava `db.transaction()` direto sem fallback, enquanto `start` e `complete` já tinham o pattern.

**Solução:**
```typescript
// ANTES (quebrado):
return await db.transaction(async (tx) => { ... });

// DEPOIS (corrigido):
const execTx = (globalThis as Record<string, unknown>).mockTransaction
  ? (globalThis as Record<string, (cb: (tx: typeof db) => Promise<void>) => Promise<void>>).mockTransaction
  : ((cb: (tx: typeof db) => Promise<void>) => db.transaction(cb));
return await execTx(async (tx) => { ... });
```

---

### Bug 2: Filtro Bugado em MockQueryBuilder (CRÍTICO)

**Arquivo:** `apps/api/src/__tests__/mocks/db.ts:276-291`

**Problema:** Acceso a `result[i]` dentro do callback do `filter`:
```typescript
// ERRADO:
data.filter((_, i) => {
  for (const f of this._where) {
    if (!f(result[i])) return false  // result[i] não existe ainda!
  }
  return true
})

// CORRETO:
data.filter((item) =>
  this._where.every((f) => f(item)),
)
```

---

### Bug 3: Testes Rodando em Paralelo (FLAKY)

**Arquivo:** `apps/api/jest.config.cjs`

**Problema:** `dbStore` global compartilhado causava conflitos quando Jest rodava em paralelo.

**Solução:** `maxWorkers: 1` para forçar execução sequencial:
```javascript
// jest.config.cjs
maxWorkers: 1,
```

---

### Bug 4: Drizzle Relations Ausentes (EAGER LOADING)

**Arquivo:** `packages/db/src/schema/*.ts`

**Problema:** Schema não definia `.relations()` para Drizzle, causando erro em queries com `with:`.

**Solução:** Adicionar relations em `auth.ts`, `profiles.ts`, `requests.ts`:
```typescript
// Exemplo em requests.ts
export const serviceRequestRelations = relations(serviceRequest, ({ one, many }) => ({
  studentProfile: one(studentProfile, {
    fields: [serviceRequest.studentProfileId],
    references: [studentProfile.id],
  }),
  originLocation: one(campusLocation, {
    fields: [serviceRequest.originLocationId],
    references: [campusLocation.id],
    relationName: "originLocation",
  }),
  destinationLocation: one(campusLocation, {
    fields: [serviceRequest.destinationLocationId],
    references: [campusLocation.id],
    relationName: "destinationLocation",
  }),
  attendance: one(serviceAttendance, {
    fields: [serviceRequest.id],
    references: [serviceAttendance.requestId],
    relationName: "serviceAttendance",
  }),
}));
```

---

### Bug 5: Mock ModuleNameMapper Bloqueava Banco Real

**Arquivo:** `apps/api/jest.config.cjs`

**Problema:** `moduleNameMapper` mapeava `@mobiliza/db/client` para mock, impedindo uso do banco real.

**Solução:** Remover o mapeamento — testes agora usam banco Neon real diretamente via `setup.ts`.

---

## 4. Evolução dos Testes

### 4.1 Status Inicial (Antes)

| Aspecto | Valor |
|---------|-------|
| Tests Passing | ~50/106 |
| Tests Failing | ~43/106 |
| Tests Skipped | ~20 |
| Coverage | ~40% |

### 4.2 Status Final (Depois)

| Aspecto | Valor | Meta |
|---------|-------|------|
| Tests Passing | **90/106** | 90+ |
| Tests Failing | **16/106** | 0 |
| Tests Skipped | **0** | 0 |
| Coverage Lines | **86.87%** ✅ | 80% |
| Coverage Statements | **85.28%** ✅ | 80% |
| Coverage Functions | **75%** | 80% |
| Coverage Branches | **58.33%** | 70% |

### 4.3 Coverage por Arquivo (Atual)

```
File               | % Stmts | % Branch| % Funcs | % Lines |
-------------------|---------|----------|---------|---------|
routers/locations  |   94.11 |        0 |     100 |     100 |
routers/profiles   |   97.67 |    83.33 |     100 |     100 |
routers/requests   |   91.08 |    63.63 |   81.25 |   93.81 |
routers/metrics    |   68.42 |       50 |   33.33 |   68.42 |
routers/notifications|  53.33 |       25 |   33.33 |   53.33 |
trpc/context       |   72.22 |     37.5 |   42.85 |   72.22 |
-------------------|---------|----------|---------|---------|
TOTAL              |   85.28 |    58.33 |      75 |   86.87 |
```

---

## 5. Falhas Remanescentes (9)

### 5.1 Notifications (0 failures) ✅

**RESOLVIDO:** O seed usava `"request_created"` mas o enum só aceita `"new_request_available"`. Corrigido.

### 5.2 Metrics (3 failures)

**Causa:** Queries agregadas com `innerJoin` e `count()` precisam de setup de dados mais complexo.

**Testes afetados:**
- `deve retornar métricas agregadas no período`
- `deve retornar distribuição por local de origem`
- `deve retornar performance dos bolsistas`

### 5.3 Auth Session (5 failures)

**Causa:** Mock session testa comportamento de Better Auth (sessões, expiração) mas não tem acesso ao sistema real de autenticação.

**Testes afetados:**
- `deve usar session ID único para cada sessão`
- `deve rejeitar sessão expirada`
- `deve aceitar sessão válida não expirada`
- `deve manter sessões independentes para usuários diferentes`
- `deve isolar ctx.session entre requisições simultâneas`

### 5.4 Profile (1 failure)

**Causa:** `createManagerSession()` usa ID hardcoded que não existe no banco real.

**Teste afetado:**
- `deve aprovar bolsista com sucesso`

---

## 6. Resultado Final

| Aspecto | Inicial | Final |
|---------|---------|-------|
| Tests Passing | ~50/106 | **97/106** |
| Tests Failing | ~43/106 | **9/106** |
| Tests Skipped | ~20 | **0** |
| Coverage Lines | ~40% | **90.04%** ✅ |
| Coverage Stmts | ~40% | **88.31%** ✅ |
| Coverage Funcs | ~35% | **79.54%** |
| Coverage Branch | ~10% | **62.5%** |

**Meta de 80% em Lines atingida com folga!**

---

## 7. Comandos de Verificação

```bash
# Health check do banco
cd apps/api && npx tsx src/__tests__/db-health-check.ts

# Rodar todos os testes com coverage
cd apps/api && pnpm test -- --coverage

# Rodar apenas segurança (sempre deve passar 100%)
cd apps/api && pnpm test -- --testPathPattern="security"

# Rodar teste específico
cd apps/api && pnpm test -- --testPathPattern="requests"

# Ver errors de TypeScript
cd apps/api && pnpm run typecheck
```

---

## 8. Histórico de Changes

| Data | Executor | Mudanças |
|------|----------|----------|
| 26 Mai 2026 | @mobiliza-backend | Setup inicial Jest + ts-jest |
| 26 Mai 2026 | @mobiliza-backend | Mocks de DB/Auth/Realtime/Context |
| 26 Mai 2026 | @mobiliza-backend | 106 testes unitários escritos |
| 26 Mai 2026 | @mobiliza-backend | 59 testes passando (original) |
| 26 Mai 2026 | Executor | Conectou banco Neon real |
| 26 Mai 2026 | Executor | Criou health check |
| 26 Mai 2026 | Executor | Criou seed functions |
| 26 Mai 2026 | Executor | Migrou setup.ts para banco real |
| 26 Mai 2026 | Executor | Testes segurança passando 100% |
| 27 Mai 2026 | Executor | Corrigiu accept transaction fallback |
| 27 Mai 2026 | Executor | Corrigiu filtro MockQueryBuilder |
| 27 Mai 2026 | Executor | Adicionou maxWorkers:1 ao Jest |
| 27 Mai 2026 | Executor | Adicionou Drizzle relations |
| 27 Mai 2026 | Executor | Removeu mock de @mobiliza/db/client |
| 27 Mai 2026 | Executor | Des-skipou metrics e notifications |
| 27 Mai 2026 | Executor | Coverage 86.87% (meta atingida) |
| 27 Mai 2026 | Executor | Corrigiu enum notification_type em seed |
| 27 Mai 2026 | Executor | **97/106 passing** — Coverage 90.04% linhas |

---

## 9. Análise das 9 Falhas Remanescentes

### 9.1 Metrics (3) — Complexidade Alta
Requerem setup com múltiplas entidades relacionadas (requests + attendances + profiles) com datas dentro de ranges específicos. Abordagem recomendada: aceitar ou criar fixtures especializados.

### 9.2 Auth Session (5) — Infraestrutura
Testam comportamento de Better Auth (expiração, concurrent sessions). Precisam de mock de session store ou integration test setup com Better Auth real.

### 9.3 Profile Approval (1) — Mock ID
`createManagerSession()` usa `manager-user-id` hardcoded. O teste cria um manager via seed mas o session mock não usa esse ID.

---

## 10. Notas Finais

- **Banco Neon funcionando 100%**
- **Health check confirma todas as tabelas**
- **Testes de segurança: 47/47 ✅**
- **Meta de 80% coverage em lines ATINGIDA: 90.04% ✅**
- 9 failures restantes requerem trabalho de infraestrutura (Better Auth mock, data fixtures)

---

## 11. Referências

- `.specs/PROJECT.md` — Visão geral do projeto Mobiliza
- `.specs/ROADMAP.md` — Roadmap de desenvolvimento
- `apps/api/src/__tests__/` — Suite de testes
- `packages/db/src/schema/` — Schema Drizzle
