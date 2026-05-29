## Contratos compartilhados

O pacote `@mobiliza/contracts` reúne os schemas e contratos compartilhados entre cliente, API e domínio. Ele serve como camada de validação e padronização dos dados que circulam no monorepo.

### Responsabilidades

* declarar schemas com Zod
* manter tipos compartilhados entre aplicações
* evitar duplicação de regras de validação
* servir de base para inputs e outputs da API

### Como pensar neste pacote

* se o dado é compartilhado entre múltiplas camadas, ele pertence aqui
* se a regra é de negócio, ela pertence em `@mobiliza/domain`
* se o dado é específico de persistência, ele pertence em `@mobiliza/db`

### Observação

Este pacote deve continuar simples e focado em contratos estáveis.