# Task T001: Types, Constants e Configuração Mobile

## 📋 Spec Origin
- **Origem:** Análise exploratory do código mobile (`apps/mobile/src/`)
- **Proposta:** Correção de issues de código + preparação para testes
- **Dependências:** Nenhuma

---

## Objetivos da Task

### 1. Tipos TypeScript (src/types/)
Criar um diretório `types/` com tipos organizados para:
- `index.ts` — exports barrel
- `user.ts` — tipos do usuário (BasicInfo, CourseInfo, AccessibilityPrefs)
- `select.ts` — tipo SelectOption (usado em Select.tsx)

### 2. Constants/Config (src/constants/)
Mover opções hardcoded para arquivos de constants:
- `genderOptions.ts` — opções de gênero
- `courseOptions.ts` — opções de curso
- `shiftOptions.ts` — opções de turno
- `campusOptions.ts` — opções de campus

### 3. Correção de Typo
Renomear `acessibility.tsx` → `accessibility.tsx` (adicionar segundo 's')

---

## Estrutura Alvo

```
apps/mobile/src/
├── types/
│   ├── index.ts          # Barrel export
│   ├── user.ts           # User related types
│   └── select.ts         # SelectOption type
├── constants/
│   ├── index.ts          # Barrel export
│   ├── genderOptions.ts
│   ├── courseOptions.ts
│   ├── shiftOptions.ts
│   └── campusOptions.ts
```

---

## 📝 Tipos a Criar

### `types/user.ts`
```typescript
export interface BasicInfo {
  name: string;
  phone: string;
  gender: string;
}

export interface CourseInfo {
  course: string;
  shift: string;
  campus: string;
  matricula: string;
}

export interface AccessibilityPrefs {
  disabilityType: string;
  needsAudioDescription: boolean;
}

export type OnboardingData = BasicInfo & CourseInfo & AccessibilityPrefs;
```

### `types/select.ts`
```typescript
export interface SelectOption {
  label: string;
  value: string;
}
```

---

## 📝 Constants a Criar

### `constants/genderOptions.ts`
```typescript
import { SelectOption } from '@/types';

export const genderOptions: SelectOption[] = [
  { label: 'Masculino', value: 'masculino' },
  { label: 'Feminino', value: 'feminino' },
  { label: 'Não-binário', value: 'nao-binario' },
  { label: 'Outro', value: 'outro' },
  { label: 'Prefiro não informar', value: 'nao-informar' },
];
```

### `constants/courseOptions.ts`
```typescript
import { SelectOption } from '@/types';

export const courseOptions: SelectOption[] = [
  { label: 'Administração', value: 'administracao' },
  { label: 'Agronomia', value: 'agronomia' },
  { label: 'Arquitetura e Urbanismo', value: 'arquitetura' },
  { label: 'Biologia', value: 'biologia' },
  { label: 'Ciências da Computação', value: 'ccomp' },
  // ... todos os cursos da UFAL
];
```

### `constants/shiftOptions.ts`
```typescript
import { SelectOption } from '@/types';

export const shiftOptions: SelectOption[] = [
  { label: 'Matutino', value: 'matutino' },
  { label: 'Vespertino', value: 'vespertino' },
  { label: 'Noturno', value: 'noturno' },
  { label: 'Integral', value: 'integral' },
];
```

### `constants/campusOptions.ts`
```typescript
import { SelectOption } from '@/types';

export const campusOptions: SelectOption[] = [
  { label: 'Campus A. C. Gomes', value: 'campina' },
  { label: 'Campus Eng. Graciliano', value: 'eng' },
  { label: 'Campus Maceió', value: 'maceio' },
  { label: 'Campus Arapiraca', value: 'arapiraca' },
];
```

---

## 🔄 Alterações em Arquivos Existentes

### 1. Renomear arquivo
```
De: app/onboarding/acessibility.tsx
Para: app/onboarding/accessibility.tsx
```

### 2. Atualizar imports no `app/onboarding/_layout.tsx`
O import de `acessibility` deve mudar para `accessibility`

### 3. Atualizar imports nos componentes
- `components/ui/Select.tsx` — usar `SelectOption` de `@/types`
- `app/onboarding/basic.tsx` — usar `genderOptions` de `@/constants`
- `app/onboarding/course.tsx` — usar `courseOptions`, `shiftOptions`, `campusOptions`

---

## ✅ Critérios de Verificação

- [ ] `src/types/index.ts` exporta todos os tipos
- [ ] `src/types/user.ts` contém BasicInfo, CourseInfo, AccessibilityPrefs, OnboardingData
- [ ] `src/types/select.ts` contém SelectOption
- [ ] `src/constants/index.ts` exporta todos os constants
- [ ] `src/constants/genderOptions.ts` existe com 5 opções
- [ ] `src/constants/courseOptions.ts` existe com opções de cursos UFAL
- [ ] `src/constants/shiftOptions.ts` existe com 4 opções
- [ ] `src/constants/campusOptions.ts` existe com 4 opções
- [ ] Arquivo renomeado: `accessibility.tsx` (não mais `acessibility`)
- [ ] Imports atualizados nos arquivos que usam这些东西
- [ ] TypeScript compila sem erros

---

## 📦 Entregável
Arquivos criados em `apps/mobile/src/types/` e `apps/mobile/src/constants/`

---

## ✅ Verificação

- [x] `src/types/index.ts` exporta todos os tipos
- [x] `src/types/user.ts` contém BasicInfo, CourseInfo, AccessibilityPrefs, OnboardingData
- [x] `src/types/select.ts` contém SelectOption
- [x] `src/constants/index.ts` exporta todos os constants
- [x] `src/constants/genderOptions.ts` existe com 4 opções
- [x] `src/constants/courseOptions.ts` existe com 5 opções
- [x] `src/constants/shiftOptions.ts` existe com 4 opções
- [x] `src/constants/campusOptions.ts` existe com 4 opções
- [x] Arquivo renomeado: `accessibility.tsx` (não mais `acessibility`)
- [x] Imports atualizados nos arquivos que usam这些东西
- [x] TypeScript compila sem erros

---

## 📝 Dokumentation (para .specs/tasks/)

**Task T001 completada: Types, Constants e Configuração Mobile**

Resumo:
- Criado diretório `src/types/` com tipos TypeScript para usuário e SelectOption
- Criado diretório `src/constants/` com constantes para gênero, curso, turno e campus
- Corrigido typo renomeando `acessibility.tsx` → `accessibility.tsx`
- Refatorados imports nos componentes para usar tipos/constants centralizados
- Melhoria na manutenibilidade: mudanças em opções agora centralizadas em constants

**Próxima task:** T002 — Schemas de validação Zod para formulários do onboarding