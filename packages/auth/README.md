<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../../.github/auth.png">
  <source media="(prefers-color-scheme: light)" srcset="../../.github/auth.png">
  <img alt="Capa do projeto Mobiliza" src="../../.github/auth.png">
</picture>

## Autenticação

O pacote `@mobiliza/auth` concentra a camada de autenticação compartilhada do Mobiliza. Ele isola a integração com Better Auth e expõe as entradas usadas por aplicações diferentes do monorepo.

### Responsabilidades

* centralizar a configuração de autenticação
* expor pontos de entrada para cliente, servidor e proxy
* reutilizar o schema e os adapters compartilhados
* manter a autenticação fora das aplicações finais

### Exportações públicas

* `@mobiliza/auth`
* `@mobiliza/auth/client`
* `@mobiliza/auth/server`
* `@mobiliza/auth/proxy`

### Dependências principais

* `better-auth`
* `@mobiliza/db`
* `@mobiliza/env`

### Observação

Aplicações como `apps/api` e `apps/web` devem consumir este pacote ao invés de recriar configuração de autenticação localmente.