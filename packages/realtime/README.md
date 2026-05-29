<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../../.github/realtime.png">
  <source media="(prefers-color-scheme: light)" srcset="../../.github/realtime.png">
  <img alt="Capa do projeto Mobiliza" src="../../.github/realtime.png">
</picture>

## Tempo real

O pacote `@mobiliza/realtime` abstrai os provedores de comunicação em tempo real usados pela plataforma. A ideia é manter a API do projeto independente de um SDK específico e trocar a implementação apenas por configuração.

### O que este pacote resolve

* publicação de eventos em canais
* inscrição e cancelamento de listeners
* adaptação para server e client
* mocks para testes automatizados

### Provedores suportados

* Supabase
* WebSocket
* Ably
* Pusher
* Mock para testes

### Estrutura esperada

```text
packages/realtime/
  src/
    adapters/   -> implementações por provedor
    index.ts    -> exportações públicas
    types.ts    -> interfaces principais
```

### Configuração

O provedor ativo é definido por variável de ambiente no pacote que consome o realtime, normalmente `apps/api`.

### Uso

O servidor usa a factory principal do pacote. O cliente usa o adaptador específico do provedor escolhido.

### Observação

Este pacote existe para manter o restante do sistema desacoplado da infraestrutura de tempo real. Isso facilita testes, troca de provedor e evolução da plataforma.
