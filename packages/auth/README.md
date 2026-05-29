<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../../.github/auth.png">
  <source media="(prefers-color-scheme: light)" srcset="../../.github/auth.png">
  <img alt="Capa do projeto Mobiliza" src="../../.github/auth.png">
</picture>

# @mobiliza/auth

Camada compartilhada de autenticação do Mobiliza.

O pacote encapsula a configuração do Better Auth e expõe entradas separadas para servidor, cliente e proxy. Assim, `apps/api` e `apps/web` usam a mesma base de autenticação sem duplicar regras, schema ou configuração de provider.

---

## Arquitetura

Este pacote segue uma divisão simples:

```text
packages/auth/
  src/
    index.ts   → instância do Better Auth para o backend
    client.ts  → cliente do browser / React Native
    server.ts  → helpers para leitura de sessão no servidor
    proxy.ts   → utilitário para detectar cookie de sessão
```

### Papel de cada entrada

| Entrada | Papel | Consumidor típico |
| --- | --- | --- |
| `@mobiliza/auth` | Instância principal do Better Auth com Drizzle, schema e providers | `apps/api` |
| `@mobiliza/auth/client` | Cliente para login, sessão e ações do lado da UI | `apps/web`, `apps/mobile` |
| `@mobiliza/auth/server` | Helper para ler a sessão com segurança no servidor | `apps/api`, `apps/web` |
| `@mobiliza/auth/proxy` | Função utilitária para detectar cookie de sessão | `apps/web` proxy/middleware |

### O que este pacote resolve

* centraliza a configuração do Better Auth
* compartilha o schema do banco entre todas as aplicações
* expõe uma API única para client, server e proxy
* mantém os detalhes de autenticação fora das aplicações finais
* facilita testes com utilitários do próprio Better Auth

### Decisão arquitetural

Este pacote implementa a ideia de “auth como infraestrutura compartilhada”, não como lógica de produto.

Vantagens principais:

* **Consistência**: `api`, `web` e qualquer outro consumidor usam o mesmo contrato.
* **Menos duplicação**: o adapter do Drizzle e o schema de autenticação vivem em um único lugar.
* **Evolução controlada**: adicionar provider social, campo de usuário ou regra de sessão não exige refatoração espalhada.
* **Testabilidade**: o plugin `testUtils()` permite criar sessões reais em testes.

---

## Dependências

| Dependência | Função |
| --- | --- |
| `better-auth` | Motor principal de autenticação |
| `@mobiliza/db` | Schema e client do banco usados pelo adapter |
| `@mobiliza/env` | Variáveis de ambiente e configuração compartilhada |

---

## Configuração

A configuração real do pacote vem de `@mobiliza/env/auth` e do schema do banco em `@mobiliza/db/schema`.

### Variáveis esperadas

As variáveis exatas podem variar conforme o ambiente, mas a base do pacote usa:

* credenciais do Google OAuth
* origens confiáveis para sessão e callbacks

### Modelo mental da configuração

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
TRUSTED_ORIGINS=https://localhost:3000,https://app.exemplo.com
```

### Estrutura de sessão

O pacote já configura o campo adicional `role` no usuário, com valor padrão `student`. Isso é importante porque o restante da aplicação pode usar esse dado para autorização sem fazer consultas extras.

---

## Uso no servidor

A instância principal é exportada por [src/index.ts](src/index.ts). Ela já vem configurada com:

* `drizzleAdapter(db, ...)`
* schema de autenticação (`user`, `session`, `account`, `verification`)
* provider social Google
* `trustedOrigins`
* `testUtils()` para testes

### Autenticação na API

```ts
import { auth } from "@mobiliza/auth";

// Endpoint de autenticação
export async function handler(request: Request) {
	return auth.handler(request);
}
```

### Leitura de sessão

```ts
import { getSession } from "@mobiliza/auth/server";

const session = await getSession(request.headers);

if (!session) {
	throw new Error("Não autenticado");
}
```

### Uso no bootstrap da API

```ts
import { auth } from "@mobiliza/auth";

const currentSession = await auth.api.getSession({ headers });
```

### O que a instância já cobre

* tabelas `user`, `session`, `account` e `verification`
* campo extra `role` no usuário
* expiração de sessão em 30 dias
* renovação de sessão a cada 24 horas
* login social com Google

---

## Uso no cliente

O cliente do pacote está em [src/client.ts](src/client.ts) e usa `better-auth/react`.

```ts
"use client";

import { authClient } from "@mobiliza/auth/client";

await authClient.signIn.social({
	provider: "google",
});
```

### Fluxo esperado no frontend

1. o frontend importa `authClient`
2. a sessão é lida e mantida pelo Better Auth
3. ações como login, logout e revalidação acontecem via API de autenticação
4. a UI reage ao estado autenticado sem recriar a configuração no app

### Base da URL

O cliente monta a URL de autenticação a partir de `backendBaseUrl`, apontando para `/api/auth`.

```ts
baseURL: `${backendBaseUrl}/api/auth`,
```

Isso mantém o frontend independente do host concreto, desde que a base do backend esteja configurada corretamente.

---

## Proxy

O utilitário em [src/proxy.ts](src/proxy.ts) ajuda o proxy ou middleware a detectar se existe cookie de sessão.

```ts
import { hasSessionCookie } from "@mobiliza/auth/proxy";

if (hasSessionCookie(request.headers)) {
	// Sessão provavelmente presente
}
```

### Quando usar

* redirecionar usuários já autenticados
* evitar trabalho extra em rotas públicas
* otimizar decisões de middleware sem abrir a sessão completa

---

## Testes

O pacote já inclui `testUtils()` na instância principal do Better Auth.

```ts
import { auth } from "@mobiliza/auth";

const session = await auth.test.login({
	userId: "user-123",
});
```

### O que isso permite

* criar sessões reais em testes de integração
* validar handlers de autenticação sem interface gráfica
* simular usuários autenticados em cenários de API

---

## Convenções

### Exportações públicas

* `@mobiliza/auth`
* `@mobiliza/auth/client`
* `@mobiliza/auth/server`
* `@mobiliza/auth/proxy`

### Fluxo recomendado

1. configurar `@mobiliza/env/auth`
2. garantir que o schema de `@mobiliza/db` esteja disponível
3. usar `@mobiliza/auth` no backend
4. usar `@mobiliza/auth/client` no frontend
5. usar `@mobiliza/auth/server` e `@mobiliza/auth/proxy` onde a sessão precisar ser lida sem duplicação

---

## Observação

Aplicações como `apps/api` e `apps/web` devem consumir este pacote ao invés de recriar configuração de autenticação localmente. Isso mantém a autenticação consistente, reduz duplicação e centraliza alterações sensíveis em um único lugar.