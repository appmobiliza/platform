<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../../.github/realtime.png">
  <source media="(prefers-color-scheme: light)" srcset="../../.github/realtime.png">
  <img alt="Capa do projeto Mobiliza" src="../../.github/realtime.png">
</picture>

# @mobiliza/realtime

Adaptador de tempo real **agnóstico de provedor** para o Mobiliza.

O restante da aplicação importa apenas os contratos públicos do pacote. A escolha entre Supabase, WebSocket próprio, Ably, Pusher ou mock é feita por configuração e pela camada que vai consumir a API.

---

## Estrutura

```text
packages/realtime/
  src/
    types.ts                   → interfaces RealtimeAdapter e RealtimeClientAdapter
    index.ts                   → factory createRealtimeAdapter() + re-exports
    adapters/
      server/
        supabase.ts            → Supabase Realtime (broadcast)
        websocket.ts           → WebSocket nativo (servidor ws)
        ably.ts                → Ably Realtime
        pusher.ts              → Pusher Channels
        mock.ts                → Mock em memória (testes)
      client/
        supabase.ts            → Supabase client (React Native / Next.js)
        websocket.ts           → WebSocket nativo (browser / RN)
        mock.ts                → Mock client (testes de componente)
  __tests__/
    adapters.test.ts
```

---

## Arquitetura

Este pacote implementa o padrão **Adapter**.

O contrato central está em [src/types.ts](src/types.ts) e define o que o restante da aplicação pode esperar de cada implementação. A entrada pública está em [src/index.ts](src/index.ts), que resolve o provider em tempo de execução no servidor e reexporta os adapters client-side para o frontend.

### O que vai para cada camada

* `types.ts` concentra os contratos e os tipos compartilhados.
* `index.ts` concentra a fábrica do servidor e os re-exports públicos.
* `adapters/server` contém as implementações usadas pelo backend.
* `adapters/client` contém as implementações usadas pelo app React Native e pelo frontend Next.js.

### Decisão arquitetural

Vantagens do desenho atual:

* **Sem lock-in**: trocar de provedor é basicamente trocar configuração.
* **Testabilidade**: os adapters `mock` permitem testar sem infraestrutura externa.
* **Coerência**: cliente e servidor falam a mesma linguagem conceitual, mesmo com implementações diferentes.
* **Bundle menor no servidor**: o provider real é carregado dinamicamente apenas quando necessário.

---

## Configuração

Defina `REALTIME_PROVIDER` no `.env` do pacote que consome o realtime, normalmente `apps/api`.

| Provider | `REALTIME_PROVIDER` | Variáveis adicionais |
| --- | --- | --- |
| Supabase | `supabase` | `SUPABASE_URL`, `SUPABASE_ANON_KEY` |
| WebSocket | `websocket` | `WS_URL` como `ws://0.0.0.0:4001` |
| Ably | `ably` | `ABLY_API_KEY` |
| Pusher | `pusher` | `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER` |
| Mock | `mock` | — |

Do ponto de vista do consumidor, carregue apenas o provider que for usar e mantenha as variáveis correspondentes no ambiente:

```bash
# Supabase
pnpm add @supabase/supabase-js --filter @mobiliza/api

# WebSocket
pnpm add ws --filter @mobiliza/api

# Ably
pnpm add ably --filter @mobiliza/api

# Pusher
pnpm add pusher --filter @mobiliza/api
```

---

## Uso no pacote `api` (server-side)

No backend, use `createRealtimeAdapter()` para carregar o provider correto em runtime.

```ts
import { createRealtimeAdapter } from '@mobiliza/realtime'

// Inicializa uma vez no bootstrap do servidor
const realtime = await createRealtimeAdapter()

// Publica um evento para todos os clientes numa sala
await realtime.publish('sala:42', 'voto:registrado', {
	userId: 'user-abc',
	valor: 5,
})

// Escuta eventos de um canal (ex.: integração interna entre serviços)
const cancelar = realtime.subscribe('sala:42', 'voto:registrado', (data) => {
	console.log('voto recebido:', data)
})

// Remove inscrição de um canal específico (ex.: sala encerrada)
await realtime.unsubscribe('sala:42')

// Encerramento gracioso
await realtime.disconnect()
```

### Convenção de canais

Para manter consistência entre cliente e servidor, use o padrão:

```text
{recurso}:{id}

sala:42           → eventos de uma sala específica
presenca:sala:42  → presença (quem está online)
usuario:abc       → eventos de um usuário específico
```

---

## Uso no app React Native / Next.js (client-side)

O client-side não usa `createRealtimeAdapter()`. Ele instancia diretamente o adapter do provider escolhido.

```ts
import { SupabaseClientAdapter } from '@mobiliza/realtime'

const adapter = new SupabaseClientAdapter({
	url: process.env.EXPO_PUBLIC_SUPABASE_URL!,
	anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
})

// Em um hook React
useEffect(() => {
	const unsub = adapter.subscribe('sala:42', 'voto:registrado', (data) => {
		setVotos((prev) => [...prev, data])
	})

	return () => {
		unsub()
	}
}, [salaId])
```

Para usar WebSocket em vez de Supabase no client:

```ts
import { WebSocketClientAdapter } from '@mobiliza/realtime'

const adapter = new WebSocketClientAdapter({
	url: 'ws://seu-servidor.nac.br:4001',
	autoReconnect: true,
	reconnectInterval: 3000,
})
```

Os demais adapters client-side seguem a mesma lógica: a aplicação escolhe o provider, o pacote entrega a implementação.

---

## Testes

O `MockRealtimeAdapter` e o `MockClientAdapter` existem para testar realtime sem nenhuma conexão externa.

```ts
// Server
import { MockRealtimeAdapter } from '@mobiliza/realtime'

const realtime = new MockRealtimeAdapter()
await realtime.publish('sala:1', 'voto', { valor: 5 })
expect(realtime.published).toHaveLength(1)

// Client (testes de componente)
import { MockClientAdapter } from '@mobiliza/realtime'

const adapter = new MockClientAdapter()
render(<SalaScreen realtimeAdapter={adapter} />)

act(() => {
	adapter.simulateEvent('sala:42', 'voto:registrado', { valor: 5 })
})

expect(screen.getByText('Votos: 1')).toBeInTheDocument()
```

---

## Como executar

```bash
pnpm --filter @mobiliza/realtime build
pnpm --filter @mobiliza/realtime check-types
pnpm --filter @mobiliza/realtime test
```

| Script | O que faz | Quando usar |
| --- | --- | --- |
| `build` | Compila o pacote com TypeScript | Antes de validar integração ou distribuição |
| `check-types` | Faz checagem de tipos sem emitir build | Durante desenvolvimento e revisão |
| `test` | Executa a suíte de testes com Jest | Para validar adapters, mocks e contratos |

---

## Observação

Este pacote existe para manter o restante do sistema desacoplado da infraestrutura de tempo real. Isso facilita testes, troca de provedor e evolução da plataforma sem espalhar dependência de SDK por toda a aplicação.
