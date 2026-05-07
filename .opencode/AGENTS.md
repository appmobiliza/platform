# AGENTS.MD — Manifesto de Conduta para Agentes do Projeto Mobiliza

> **Este documento define as regras, metodologias e restrições que TODOS os agentes devem seguir ao trabalhar no projeto Mobiliza.**
>
> **NÃO ignore nenhuma seção. Cada regra existe por uma razão.**

---

## 1. IDENTIDADE DO PROJETO

### 1.1 O que é o Mobiliza?

Sistema de mobilidade assistida para estudantes com deficiência (PcD) da UFAL. O projeto substitui o fluxo manual via WhatsApp por uma plataforma digital composta por:

- **App Mobile** — Para estudantes PcD e bolsistas
- **Dashboard Web** — Para gestão do NAC (Núcleo de Acessibilidade)
- **Backend Centralizado** — API tRPC com PostgreSQL/Drizzle

### 1.2 Valores Centrais

| Valor | Significado |
|-------|-------------|
| **Acessibilidade** | Prioridade absoluta. Todo código deve funcionar com leitores de tela, navegação por teclado, alto contraste. |
| **Privacidade** | Dados dos estudantes NUNCA expostos publicamente. |
| **Rastreabilidade** | Cada ação no sistema deve ser registrável e auditable. |
| **Clean Architecture** | Separação clara: contracts → domain → api. |

---

## 2. METODOLOGIA TLC (Thought, Logic, Code)

### 2.1 O que é?

**Obrigatório para qualquer implementação.** Você NUNCA pode pular diretamente para "codar" sem passar pelas etapas anteriores.

```
┌─────────┐    ┌─────────┐    ┌─────────┐
│ THOUGHT │ →  │  LOGIC  │ →  │  CODE   │
│         │    │         │    │         │
│Entender │    │Planificar│    │Implementar
└─────────┘    └─────────┘    └─────────┘
```

### 2.2 Como aplicar

#### THOUGHT (Entender)

Antes de escrever qualquer código, responda:
- **O que** estou tentando resolver?
- **Por que** esta solução é necessária?
- **Quem** vai usar isso?
- **Onde** se encaixa na arquitetura?

#### LOGIC (Planificar)

Após entender, descreva a solução:
- **Quais arquivos** preciso modificar/criar?
- **Qual a sequência** de alterações?
- **O que pode dar errado?** (edge cases, falhas, side effects)
- **Como vou verificar** que funcionou? (testes, assertions)

#### CODE (Implementar)

Apenas APÓS passar por Thought e Logic:
- Implemente a solução planejada
- Execute os testes
- Verifique lint e types
- Commit com Conventional Commits

### 2.3 Quando NÃO aplicar (Quick Mode)

Para tarefas ≤ 3 arquivos e escopo claro, você pode pular para implementação direta, mas ainda DEVE listar mentalmente:
1. O que vou fazer
2. Onde
3. Como verificar

Se isso revelar >5 steps, volte para o fluxo completo.

---

## 3. SKILLS OBRIGATÓRIAS POR AGENT

### 3.1 Regras de Leitura de Skills

**REGRA:** Todo agent DEVE ler as skills listadas abaixo ANTES de executar tarefas.

| Agent | Skills Obrigatórias | Quando Ler |
|-------|---------------------|------------|
| `@plan` (Orchestrator) | `tlc-spec-driven`, `coding-guidelines`, `commit-helper`, `codenavi`, `sequential-thinking` | Ao iniciar qualquer planejamento (DEVE invocar explorer antes de decisions) |
| `@build` (Executor) | `tlc-spec-driven`, `coding-guidelines`, `unit-testing-mastery` | Ao receber task para implementar |
| `@test` (Testes) | `unit-testing-mastery`, `coding-guidelines` | Ao criar testes |
| `@backend-dev` (Backend) | `senior-backend`, `neon-postgres`, `coding-guidelines` | Ao implementar API/backend |
| `@frontend-dev` (Frontend) | `frontend-design`, `coding-guidelines` | Ao implementar UI |
| `@debug` (Debug) | `sequential-thinking`, `browser-automation`, `codenavi` | Ao investigar problemas |
| `@explorer` (Explorer) | `codenavi`, `coding-guidelines` | Ao explorar codebase |
| `@architect` (Arquitetura) | `senior-architect`, `mermaid-studio`, `coding-guidelines` | Ao definir arquitetura e diagramas |
| `@docs` (Documentação) | `docs-writer`, `coding-guidelines` | Ao atualizar documentação e contexto |

### 3.2 Como Carregar Skills

Use a skill tool:
```
skill: tlc-spec-driven
skill: coding-guidelines
```

### 3.3 Skills Complementares (conforme necessidade)

| Skill | Quando Usar |
|-------|-------------|
| `codenavi` | Explorar codebase, encontrar padrões |
| `mermaid-studio` | Criar diagramas de arquitetura |
| `senior-architect` | Definir arquitetura, trade-offs e limites |
| `sequential-thinking` | Problemas complexos, debug |
| `docs-writer` | Documentar features, updating README |

---

## 4. DEFINITION OF DONE (DoD)

### 4.1 Critérios Obrigatórios

**Uma tarefa só está COMPLETA quando TODOS os critérios abaixo são satisfeitos:**

| Critério | Verificação | Comando |
|----------|-------------|---------|
| **Testes unitários** | Testes criados e passando | `pnpm test` |
| **Testes de integração** | Se aplicável, passing | `pnpm test:integration` |
| **TSDoc/JSDoc** | Documentação em todas funções exportadas | Review do código |
| **ESLint passing** | Zero warnings/errors | `pnpm lint` |
| **TypeScript passing** | Compilação sem erros | `pnpm check-types` |
| **Commit semântico** | Formato Conventional Commits | `git log -1` |

### 4.2 Checklist de Qualidade

```markdown
- [ ] Testes escritos (RED phase executada)
- [ ] Código implementou (GREEN phase executada)
- [ ] Refatoração feita (REFACTOR phase executada)
- [ ] Nenhum console.log em produção
- [ ] Error handling consistente
- [ ] Labels de acessibilidade (se UI)
- [ ] Commit com mensagem descritiva
```

### 4.3 Critério de PR para Merge

| Item | Status |
|------|--------|
| Todos os testes passando | ✅ |
| Coverage mantido/aumentado | ✅ |
| Zero warnings de lint | ✅ |
| Zero erros de TypeScript | ✅ |
| Documentação atualizada | ✅ |
| PR description completa | ✅ |

---

## 5. STACK TECNOLÓGICA (Alinhamento Obrigatório)

### 5.1 Stack Principal

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **TypeScript** | 5.9+ (strict mode ON) | Linguagem |
| **tRPC** | v11 | API layer |
| **Drizzle ORM** | 0.30+ | Database ORM |
| **PostgreSQL** | via Neon | Database |
| **Zod** | latest | Validation |
| **Next.js** | 16 (App Router) | Frontend Web |
| **React** | 19 | UI Library |
| **TailwindCSS** | v4 | Styling |
| **WebSockets** | (realtime pkg) | Realtime |

### 5.2 Estrutura de Arquitetura

```
platform/
├── apps/
│   ├── api/              # tRPC Server
│   │   └── src/
│   │       ├── trpc/     # Routers (orquestração ONLY)
│   │       └── routes/   # REST adapters (se necessário)
│   └── web/              # Next.js Dashboard
│       └── app/
├── packages/
│   ├── contracts/        # Zod schemas (VALIDAÇÃO ÚNICA)
│   ├── db/               # Drizzle ORM + migrations
│   ├── domain/           # REGRAS DE NEGÓCIO (lógica pura)
│   ├── realtime/         # WebSockets/eventos
│   └── ui/               # Componentes compartilhados
└── .specs/               # Documentação SDD
```

### 5.3 Padrão de Dependências

```
┌──────────────┐
│  contracts   │  ← Zod schemas (fonte única)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   domain      │  ← Lógica pura (ZERO dependências HTTP)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│     api       │  ← tRPC routers (orquestração ONLY)
└──────────────┘
```

**REGRA:** Dependências fluem em uma direção: contracts → domain → api

---

## 6. FLUXO DE TRABALHO

### 6.1 EXPANDED SDD FLOW — 6 REAL PHASES (MASTER-WORKER)

O fluxo SDD é gerenciado por dois Orquestradores Principais (`@mobiliza-plan` e `@mobiliza-build`) que delegam para sub-agentes especializados.

1. **Specify**: O `@mobiliza-plan` descreve a feature, tirando dúvidas sobre "gray areas". 
2. **Reconnaissance & Design**: `@mobiliza-plan` chama o `@mobiliza-explorer` para mapear o codebase. Depois, `@mobiliza-plan` chama o `@mobiliza-architect` para gerar o `design.md` (Mermaid/C4).
3. **Tasks (O Handoff)**: `@mobiliza-plan` gera tarefas atômicas e **cria arquivos físicos** para cada uma em `.specs/tasks/` (ex: `tela-principal-t001.md`, `tela-login-t001.md`). O handoff para o executor SEMPRE deve referenciar este arquivo.
4. **Test (RED)**: O `@mobiliza-build` assume a execução e chama o `@mobiliza-test`. O `@mobiliza-test` lê o arquivo da task e escreve os testes, que DEVEM FALHAR inicialmente.
5. **Implement (GREEN)**: `@mobiliza-build` chama os especialistas (`@mobiliza-backend`, `@mobiliza-frontend`) para fazer os testes passarem. Se falhar, chama o `@mobiliza-debug`.
6. **Review & Document (REFACTOR)**: Após os testes passarem e o commit semântico ser feito, o `@mobiliza-build` DEVE chamar o `@mobiliza-docs` para atualizar o `SUMMARY.md` e o `STATE.md` com o que foi concluído.

### 6.2 ESTRUTURA DO DIRETÓRIO `.specs/`
A documentação do projeto vive na pasta `.specs/` e deve ser rigorosamente atualizada.
- `.specs/PROJECT.md`: Visão e objetivos.
- `.specs/ROADMAP.md`: Timeline macro.
- `.specs/STATE.md`: Memória persistente do projeto atual (o que estamos fazendo AGORA).
- `.specs/SUMMARY.md`: Resumo executivo.
- `.specs/features/`: Specs e designs específicos de cada feature.
- `.specs/tasks/`: Arquivos individuais de tasks (Contratos de Handoff - tela-principal-t001.md, etc).

### 6.3 Fluxo de Commits

```
BRANCH FORMAT: <type>/<description>

Exemplo:
feat/auth-mobiliza
fix/request-timeout
docs/update-readme

COMMIT FORMAT: <type>(<scope>): <subject>

Exemplo:
feat(auth): add email validation
fix(requests): prevent duplicate submission
docs(api): update tRPC router documentation
```

---

## 7. PROIBIÇÕES (HARD RULES)

### 7.1 Regras Absolutas (nunca violar)

| Regra | Razão |
|-------|-------|
| **NUNCA** colocar lógica de negócio em tRPC routers | Viola Clean Architecture, cria acoplamento |
| **NUNCA** criar REST endpoints fora de `packages/contracts` | Quebra consistência da API |
| **NUNCA** fazer commit direto em `main`, `master` ou `develop` | Quebra fluxo de code review |
| **NUNCA** ignorar erros de lint ou type | Compromete qualidade do código |
| **NUNCA** implementar sem testar primeiro (TDD) | Compromete qualidade e rastreabilidade |
| **NUNCA** acessar `.env` ou credenciais | Segurança |
| **NUNCA** fazer force push | Pode apagar histórico de outros |
| **NUNCA** duplicar validação | Usar contracts como fonte única |

### 7.2 Regras Strongly Recommended

| Regra | Recomendação |
|-------|--------------|
| **EVITAR** `console.log` em produção | Usar logging estruturado |
| **EVITAR** estados não tratados (loading, error, empty) | UI completa e robusta |
| **EVITAR** CSS inline complexo | Usar TailwindCSS |
| **EVITAR** queries N+1 | Usar JOINs ou data loaders |

---

## 8. PADRÕES DE CÓDIGO

### 8.1 Nomenclatura

| Contexto | Padrão | Exemplo |
|----------|---------|---------|
| Arquivos | kebab-case | `create-request.ts` |
| Funções | camelCase | `createRequest()` |
| Classes/Types | PascalCase | `CreateRequestInput` |
| Constantes | UPPER_SNAKE | `MAX_RETRIES` |
| Schema Zod | Sufixo Schema | `CreateRequestSchema` |
| Testes | `.test.ts` | `create-request.test.ts` |

### 8.2 Estrutura de Arquivo

```typescript
// 1. Imports (externos primeiro, depois internos)
import { z } from 'zod';
import { CreateRequestSchema } from '@mobiliza/contracts';

// 2. Types/Interfaces (se necessário)
interface CreateRequestInput {
  origin: string;
  destination: string;
}

// 3. Implementation
export async function createRequest(input, db) {
  // ...
}

// 4. TSDoc (obrigatório para funções exportadas)
/**
 * Creates a new mobility request for a student.
 * @param input - Validated request data
 * @param db - Database instance
 * @returns Created request record
 */
```

### 8.3 Error Handling

```typescript
// CORRETO - Error handling consistente
export async function createRequest(input, db) {
  try {
    const data = CreateRequestSchema.parse(input);
    return await db.insert(requests).values(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid request data', error.errors);
    }
    throw error;
  }
}

// ❌ ERRADO - sem error handling
export async function createRequest(input, db) {
  return await db.insert(requests).values(input);
}
```

---

## 9. ACESSIBILIDADE (A11y)

### 9.1 Requisitos para UI

Todo componente DEVE ter:

| Requisito | Implementação |
|-----------|---------------|
| Labels | `aria-label` ou `aria-labelledby` |
| Keyboard nav | `tabIndex`, handlers de keyboard |
| High contrast | CSS custom properties |
| Focus visible | `:focus-visible` styles |
| Alt text | `alt` descritivo em imagens |

### 9.2 Exemplo

```tsx
// ACESSÍVEL
<button
  onClick={handleSubmit}
  aria-label="Confirmar solicitação de deslocamento"
  className="focus-visible:ring-2"
>
  Confirmar
</button>

// NÃO ACESSÍVEL
<button onClick={handleSubmit}>Confirmar</button>
```

---

## 10. SUBAGENTS E DELEGAÇÃO

### 10.1 SUB-AGENT INVOCATION PROTOCOL (CRITICAL)

Orquestradores iniciam sub-agentes com contexto limpo. Para evitar que eles ajam às cegas ou alucinem, você DEVE seguir estas regras de invocação:

1. **BAN GENERIC AGENTS**: É estritamente proibido chamar agentes "gerais" ou modelos padrão. Chame APENAS os nomes exatos listados na matriz abaixo.
2. **EXPLICIT SKILL LOADING & HANDOFF**: Ao delegar, o orquestrador DEVE comandar o sub-agente a ler suas skills obrigatórias e referenciar o arquivo físico da task. Nunca delegue apenas com "descrição curta".
   - ❌ *Exemplo RUIM*: "Chame o @mobiliza-backend e peça para ele implementar a tela-principal-t001 que é um botão de login."
   - ✅ *Exemplo BOM*: "Chame o `@mobiliza-backend`. Instrução: 'PRIMEIRO, carregue as skills `senior-backend` e `coding-guidelines`. DEPOIS, leia o arquivo `.specs/tasks/tela-principal-t001.md` e implemente a lógica descrita nele.'"
3. **ACCOUNTABILITY**: Se um sub-agente retornar código que viole o TLC Pattern, o orquestrador deve rejeitar e forçar a re-execução.

### 10.2 AGENT & SKILL DELEGATION MATRIX

| Agent | Role | Mandatory Skills to COMMAND them to read |
| :--- | :--- | :--- |
| **`@mobiliza-plan`** | **Orchestrator**. Pensa, planeja e delega. | `tlc-spec-driven`, `sequential-thinking`, `caveman` |
| **`@mobiliza-build`** | **Orchestrator**. Executa tasks delegando. | `tlc-spec-driven`, `commit-helper`, `caveman` |
| `@mobiliza-explorer` | Worker. Mapeia código pro Plan. | `codenavi`, `caveman` |
| `@mobiliza-architect`| Worker. Desenha sistemas e diagramas. | `senior-architect`, `mermaid-studio`, `caveman` |
| `@mobiliza-test` | Worker. Escreve testes TDD que falham. | `unit-testing-mastery`, `coding-guidelines` |
| `@mobiliza-backend` | Worker. Implementa APIs e DB. | `senior-backend`, `coding-guidelines` |
| `@mobiliza-frontend`| Worker. Implementa UI e A11y. | `frontend-design`, `coding-guidelines` |
| `@mobiliza-debug` | Worker. Diagnósticos de runtime e logs. | `browser-automation`, `codenavi`, bash |
| `@mobiliza-docs` | Worker. Preserva contexto da sprint. | `docs-writer` |

### 10.3 Trabalho em Paralelo

Para tasks independentes, use múltiplos subagents em paralelo:

```
[Parallel Task 1] → @mobiliza-test (criar testes)
[Parallel Task 2] → @mobiliza- backend (implementar lógica)
```

---

## 11. FLUXO DE VALIDATE

### 11.1 Após implementar feature

1. **Feature-level validation**: Verificar se todos os requisitos foram atendidos
2. **Code review**: Revisar se código segue padrões
3. **Test coverage**: Garantir que cobertura não diminuiu
4. **A11y audit**: Se UI, verificar acessibilidade
5. **Documentation**: Atualizar se necessário

---

## 12. RESUMO

### Checklist Rápido para Cada Tarefa

```
Before:
□ Read required skills
□ Understand problem (THOUGHT)
□ Plan solution (LOGIC)

During:
□ Write failing test (RED)
□ Implement minimum (GREEN)
□ Refactor (REFACTOR)

After:
□ All tests passing
□ ESLint passing
□ TypeScript passing
□ TSDoc complete
□ Commit semantic
```

---

**VERSÃO:** 1.0.0
**última atualização:** 2026-05-06
**MANUTENÇÃO:** Equipe Mobiliza
