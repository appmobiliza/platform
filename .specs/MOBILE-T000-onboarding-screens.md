# MOBILE-T000: Onboarding Screens - Documentação das Telas

## 📋 Overview
Este documento descreve as telas de onboarding implementadas no app Mobile do projeto Mobiliza, baseadas no Figma.

---

## 🎯 Telas Implementadas

### 1. `/onboarding/basic` — Dados Básicos
**Rota:** `/onboarding/basic`
**Props:** Steps 1/3

**Campos do formulário:**
- Nome Completo (`Input`)
- Telefone (`Input`, keyboardType: phone-pad)
- Gênero (`Select` com options de constants)

**Componentes utilizados:**
- `Header` (com back button)
- `StepIndicator`
- `Button`
- `Input`
- `Select`

---

### 2. `/onboarding/course` — Informações Universitárias
**Rota:** `/onboarding/course`
**Props:** Steps 2/3

**Campos do formulário:**
- Curso (`Select`)
- Turno (`Select`)
- Campus (`Select`)
- Matrícula (`Input`, keyboardType: numeric)

**Componentes utilizados:**
- `Header`
- `StepIndicator`
- `Button`
- `Input`
- `Select`

---

### 3. `/onboarding/accessibility` — Preferências de Acessibilidade
**Rota:** `/onboarding/accessibility`
**Props:** Steps 3/3

**Campos do formulário:**
- Tipo de Deficiência (TouchableOpacity cards multi-select)
- Ativar pedidos por áudio automaticamente (`Switch`)

**Opções de Deficiência:**
- Deficiência física ou mobilidade reduzida (Accessibility icon)
- Deficiência auditiva (Ear icon)
- Cegueira ou baixa visão (Eye icon)
- Outro tipo (Ellipsis icon)

**Componentes utilizados:**
- `Header`
- `StepIndicator`
- `Button`
- `Switch`
- `TouchableOpacity`

---

### 4. `/onboarding/unregistered` — Usuário Não Cadastrado
**Rota:** `/onboarding/unregistered`
**Props:** Tela informativa

**Descrição:** Alerta para usuários que não estão no sistema Mobiliza (não cadastrados no NAC).

---

## 🔗 Fluxo de Navegação

```
/ (splash) → /login → /onboarding/unregistered (se não cadastrado)
                          ↓
                    /onboarding/basic (Step 1)
                          ↓
                    /onboarding/course (Step 2)
                          ↓
                    /onboarding/accessibility (Step 3)
                          ↓
                    / (home - após completar)
```

---

## 🎨 Design System

### Cores (definidas em global.css)
```css
--color-brand-primary: #00635D   /* VerdeMobiliza */
--color-brand-background: #F8F9FA
```

### Componentes UI
| Componente | Props |
|-----------|-------|
| `Button` | variant (primary/secondary/outline/ghost), size (sm/md/lg), loading, disabled |
| `Input` | label, error, placeholder, keyboardType |
| `Select` | label, value, placeholder, options, onSelect, error |
| `Header` | title, onBack, showBack |
| `StepIndicator` | steps[], currentStepId |
| `Logo` | size (sm/md/lg/xl), light |

---

## 📁 Estrutura de Arquivos

```
apps/mobile/src/
├── app/
│   ├── _layout.tsx              # Root stack navigator
│   ├── index.tsx                # Splash screen
│   ├── login.tsx               # Login page
│   └── onboarding/
│       ├── _layout.tsx         # Onboarding stack navigator
│       ├── basic.tsx           # Step 1
│       ├── course.tsx           # Step 2
│       ├── accessibility.tsx   # Step 3
│       └── unregistered.tsx    # Not registered
├── components/
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Header.tsx
│       ├── Logo.tsx
│       └── StepIndicator.tsx
├── types/
├── constants/
├── schemas/
└── utils/
```

---

## ✅ Status de Implementação

| Tela | Status | Notas |
|------|--------|-------|
| Splash (/) | ✅ Feito | Animação 2.5s → redirect |
| Login (/login) | ✅ Feito | Google auth button |
| Basic (/onboarding/basic) | ✅ Feito | Validação via Zod (T002) |
| Course (/onboarding/course) | ✅ Feito | Validação via Zod (T002) |
| Accessibility (/onboarding/accessibility) | ✅ Feito | Validação via Zod (T002) |
| Unregistered (/onboarding/unregistered) | ✅ Feito | Alerta informativo |

---

## 📝 Notas

- **Validação:** Schemas Zod criados em `src/schemas/`
- **Types:** Tipos TypeScript organizados em `src/types/`
- **Constants:** Opções de selects centralizadas em `src/constants/`
- **Testes:** 164 testes unitários passando

---

**Versão:** 1.0.0
**Data:** 2026-05-18
**Origem:** Figma screens