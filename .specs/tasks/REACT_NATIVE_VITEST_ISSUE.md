# React Native Testing com Vitest - Issue Documentada

## Problema

### Sintomas
```
SyntaxError: Unexpected token 'typeof'
```

Os testes de componentes React Native falhavam com este erro ao usar `@testing-library/react-native` com Vitest/jsdom.

### Arquivos Afetados
- `Button.test.tsx`
- `Input.test.tsx`
- `Select.test.tsx`
- `Header.test.tsx`
- `Logo.test.tsx`
- `StepIndicator.test.tsx`

---

## Causa Raiz

1. `@testing-library/react-native` utiliza JSX `typeof` em suas definições de tipos
2. Vitest com jsdom environment não transpila corretamente este padrão
3. O transformer do Vitest (oxc/esbuild) não reconhece a sintaxe específica da biblioteca

### Peer Dependency Conflict
```
Error: Incorrect version of "react-test-renderer" detected.
Expected "19.2.3", but found "19.2.6".
```

---

## Soluções Testadas

### ✅ Funcionando
1. **Isolar lógica pura** em `src/utils/` e testar com Vitest puro
2. **Testar schemas Zod** diretamente (não dependem de renderização RN)

### ❌ Não Funcionou
1. Adicionar `@testing-library/jest-dom` - não resolve o problema
2. Instalar `vitest-environment-react-native` - pacote não existe no npm
3. Configurar `jsdom` environment - ainda gera erro de `typeof`
4. Instalar `jest-expo` - peer dependency conflicts

---

## Soluções para Futuro

### Opção 1: Jest + jest-expo (Recomendado)
```bash
npm install -D jest @types/jest jest-expo
```

Criar `jest.config.js`:
```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)'
  ],
};
```

### Opção 2: Vitest + Custom Transformer
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
  },
  esbuild: {
    include: /\.[jt]sx?$/,
    exclude: /node_modules/,
    jsx: 'automatic',
  },
  // Necesário custom babel transform para @testing-library/react-native
});
```

### Opção 3: Testing Library Web Only
Por enquanto, testar apenas lógica de negócio (schemas, utils, hooks puros) e deixar componentes UI sem testes automatizados até ambiente estar configurado.

---

## Status Atual (2026-05-18)

| Tipo de Teste | Status | Qtd Testes |
|---------------|--------|------------|
| Schemas Zod | ✅ Funcionando | 51 |
| Utils/Validation | ✅ Funcionando | 32 |
| Componentes UI | ❌ Bloqueado | 0 |

---

## Arquivos de Backup

Os testes de componentes originais foram movidos para:
```
src/__tests__/components.bak/
├── Button.test.tsx.bak
├── Header.test.tsx.bak
├── Input.test.tsx.bak
├── Logo.test.tsx.bak
├── Select.test.tsx.bak
└── StepIndicator.test.tsx.bak
```

---

## Referências

- [Jest Expo Setup](https://docs.expo.dev/develop/unit-testing/)
- [Vitest JSX](https://vitest.dev/config/#jsx)
- [Testing Library React Native](https://testing-library.com/docs/react-native-testing-library/setup)