<picture>
   <source media="(prefers-color-scheme: dark)" srcset="./.github/cover_dark.png">
   <source media="(prefers-color-scheme: light)" srcset="./.github/cover.png">
   <img alt="Capa do projeto Mobiliza" src="./.github/cover.png">
</picture>

## ✨ Visão geral

Este monorepo reúne os principais serviços e aplicações da plataforma, com foco em atendimento, gestão e estruturação de dados para o ecossistema do projeto Mobiliza.

A base atual do repositório inclui:

* uma aplicação mobile para uso em campo e operação
* um dashboard web para gestão e acompanhamento
* um backend HTTP para orquestração de rotas, autenticação e integrações
* pacotes compartilhados para domínio, contratos, ambiente, banco e tempo real

---

## 🧩 Estrutura do monorepo

### Apps

* `apps/api` — servidor HTTP com Hono, tRPC e Better Auth
* `apps/mobile` — aplicação mobile em Expo / React Native
* `apps/web` — dashboard web em Next.js

### Packages

* `packages/auth` — autenticação compartilhada com Better Auth
* `packages/contracts` — contratos e schemas compartilhados com Zod
* `packages/db` — acesso ao banco com Drizzle ORM e PostgreSQL
* `packages/domain` — regras de negócio e casos de uso
* `packages/env` — validação e centralização de variáveis de ambiente
* `packages/realtime` — integrações de tempo real e canais externos

### Configurações compartilhadas

* `config/typescript` — presets de TypeScript para o monorepo
* `biome.json` — configuração de lint e formatação
* `turbo.json` — pipeline do Turborepo

---

## 🛠️ Tecnologias principais

| Camada | Tecnologias |
| --- | --- |
| Mobile | Expo, React Native, Expo Router, NativeWind |
| Web | Next.js, React, tRPC, React Query |
| Backend | Node.js, Hono, tRPC, Better Auth |
| Dados | Drizzle ORM, PostgreSQL, Neon |
| Compartilhamento | Zod, TypeScript, pacotes internos |

---

## 🚀 Como rodar localmente

1. Instale as dependências:

```bash
pnpm install
```

2. Configure as variáveis de ambiente necessárias no arquivo `.env` da raiz.

3. Execute o ambiente de desenvolvimento:

```bash
pnpm dev
```

---

## 📦 Scripts disponíveis

Na raiz do projeto, os comandos principais são:

```bash
pnpm build
pnpm dev
pnpm lint
pnpm check-types
pnpm format-and-lint
pnpm format-and-lint:fix
```

---

## 🧹 Cleanup (reinstalação de dependências)

Caso enfrente problemas com dependências quebradas ou inconsistentes, execute os comandos abaixo para limpar os vestígios de instalações anteriores e reinstalar tudo do zero:

```bash
find . \( -name "node_modules" -o -name ".turbo" -o -name "dist" -o -name "build" \) -type d -prune -exec rm -rf '{}' +
pnpm store prune
pnpm install
```

> ⚠️ Os comandos acima removem completamente os diretórios `node_modules`, `.turbo`, `dist` e `build` de todo o monorepo, e em seguida limpam o cache global de pacotes do pnpm. Depois disso, uma nova instalação é feita.

---

## 🗄️ Banco de dados

O projeto utiliza PostgreSQL com Drizzle ORM, e o pacote `packages/db` concentra a camada de acesso ao banco.

Fluxo esperado:

* configurar `DATABASE_URL` na raiz
* manter o schema dentro de `packages/db`
* usar os scripts de migração e geração quando houver mudanças estruturais

---

## 🔌 Arquitetura em alto nível

```mermaid
flowchart LR
      M[App Mobile] --> A[API Hono + tRPC]
      W[Dashboard Web] --> A
      A --> D[Contratos + Domínio]
      D --> B[(PostgreSQL / Neon)]
      A --> R[Camada de tempo real]
```

---

## 🤝 Direção do projeto

Este repositório está organizado como base de evolução da plataforma Mobiliza. A ideia é manter a lógica compartilhada fora das aplicações e deixar cada app com sua responsabilidade clara.

Nos READMEs individuais, cada pacote e aplicação tem sua própria documentação com detalhes de execução, escopo e decisões de implementação.

---

## 📄 Licença

Consulte o arquivo [LICENSE](LICENSE) para os termos de uso do projeto.
