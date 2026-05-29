<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../../.github/db.png">
  <source media="(prefers-color-scheme: light)" srcset="../../.github/db.png">
  <img alt="Capa do projeto Mobiliza" src="../../.github/db.png">
</picture>

## Banco de dados

O pacote `@mobiliza/db` concentra a camada de persistência do Mobiliza. Ele organiza a conexão com PostgreSQL e a modelagem com Drizzle ORM.

### Responsabilidades

* configurar a conexão com o banco
* manter o schema do projeto
* expor client e helpers de acesso
* oferecer comandos de geração, migração e inspeção

### Exports públicos

* `@mobiliza/db`
* `@mobiliza/db/schema`
* `@mobiliza/db/drizzle`
* `@mobiliza/db/client`

### Scripts disponíveis

* `pnpm db:generate`
* `pnpm db:migrate`
* `pnpm db:push`
* `pnpm db:studio`

### Configuração

Este pacote depende de `DATABASE_URL` e de variáveis compartilhadas em `@mobiliza/env`.

### Observação

O ideal é que as aplicações consumam este pacote apenas para persistência, mantendo a lógica de negócio fora dele.