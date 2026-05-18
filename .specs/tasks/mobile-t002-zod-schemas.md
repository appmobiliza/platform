# Task T002: Schemas de Validação Zod

## 📋 Spec Origin
- **Origem:** Continuidade da Task T001 - preparação para testes
- **Proposta:** Criar schemas de validação Zod para formulários do onboarding
- **Dependências:** T001 (types e constants já criados)

---

## 🎯 Objetivos da Task

### 1. Criar schemas Zod para validação de formulários
Schemas em `apps/mobile/src/schemas/`:
- `basicInfo.schema.ts` — validação de nome, telefone, gênero
- `courseInfo.schema.ts` — validação de curso, turno, campus, matrícula
- `accessibility.schema.ts` — validação de tipo de deficiência e áudio
- `index.ts` — barrel export

### 2. Criar testes unitários para os schemas
Testes em `apps/mobile/src/__tests__/schemas/`:
- `basicInfo.schema.test.ts` — 19 testes
- `courseInfo.schema.test.ts` — 17 testes
- `accessibility.schema.test.ts` — 10 testes

---

## 📁 Estrutura Criada

```
apps/mobile/src/
├── schemas/
│   ├── index.ts                    # Barrel export
│   ├── basicInfo.schema.ts         # BasicInfoSchema
│   ├── courseInfo.schema.ts        # CourseInfoSchema
│   └── accessibility.schema.ts      # AccessibilitySchema
└── __tests__/
    └── schemas/
        ├── basicInfo.schema.test.ts
        ├── courseInfo.schema.test.ts
        └── accessibility.schema.test.ts
```

---

## 📝 Schemas Criados

### `basicInfo.schema.ts`
```typescript
import { z } from 'zod';

export const BasicInfoSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  phone: z.string().min(10, 'Telefone inválido').max(20),
  gender: z.string().min(1, 'Selecione seu gênero'),
});

export type BasicInfoInput = z.infer<typeof BasicInfoSchema>;
```

### `courseInfo.schema.ts`
```typescript
import { z } from 'zod';

export const CourseInfoSchema = z.object({
  course: z.string().min(1, 'Selecione o curso'),
  shift: z.string().min(1, 'Selecione o turno'),
  campus: z.string().min(1, 'Selecione o campus'),
  matricula: z.string().min(5, 'Matrícula inválida').max(20),
});

export type CourseInfoInput = z.infer<typeof CourseInfoSchema>;
```

### `accessibility.schema.ts`
```typescript
import { z } from 'zod';

export const AccessibilitySchema = z.object({
  disabilityType: z.array(z.string()).min(1, 'Selecione pelo menos uma opção'),
  needsAudioDescription: z.boolean(),
});

export type AccessibilityInput = z.infer<typeof AccessibilitySchema>;
```

---

## 📝 Testes Criados

### Cobertura por Schema

| Schema | Testes | Coverage Target |
|--------|--------|-----------------|
| BasicInfoSchema | 19 | >90% |
| CourseInfoSchema | 17 | >90% |
| AccessibilitySchema | 10 | >90% |

### Padrões de Teste
- **AAA Pattern**: Arrange → Act → Assert
- **Edge cases**: limites min/max, valores vazios, campos faltantes
- **Nomes descritivos**: `shouldFailWhenNameIsEmpty`
- **Validação de erros**: path do erro corresponde ao campo

---

## ✅ Critérios de Verificação

- [x] `schemas/basicInfo.schema.ts` criado com validações
- [x] `schemas/courseInfo.schema.ts` criado com validações
- [x] `schemas/accessibility.schema.ts` criado com validações
- [x] `schemas/index.ts` barrel export
- [x] `__tests__/schemas/basicInfo.schema.test.ts` criado (19 testes)
- [x] `__tests__/schemas/courseInfo.schema.test.ts` criado (17 testes)
- [x] `__tests__/schemas/accessibility.schema.test.ts` criado (10 testes)
- [x] Types exportados para uso nos testes
- [x] Mensagens de erro em português

---

## 📝 Dokumentation

**Task T002 completada: Schemas de Validação Zod**

Resumo:
- Criado diretório `src/schemas/` com 4 arquivos
- BasicInfoSchema: name (2-100 chars), phone (10-20 chars), gender (obrigatório)
- CourseInfoSchema: course, shift, campus, matricula (5-20 chars)
- AccessibilitySchema: disabilityType (array, min 1), needsAudioDescription (boolean)
- Criados 46 testes unitários para validar os schemas
- Coverage target: >90%

**Próxima task:** T003 — Testes unitários para componentes UI (Button, Input, Select, Header, Logo, StepIndicator)

**Nota:** Para executar testes localmente:
```bash
cd apps/mobile && pnpm install
pnpm --filter mobile test
```