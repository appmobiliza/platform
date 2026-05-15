# @mobiliza/realtime

Adaptador de tempo real **agnóstico de provedor** para o Mobiliza.

O restante da aplicação importa apenas a interface `RealtimeAdapter` — nunca
o SDK de um provedor específico. Trocar de Supabase para WebSocket próprio
(ou Ably, ou Pusher) é uma mudança de variável de ambiente.

---

## Estrutura

```
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

## Configuração

Defina `REALTIME_PROVIDER` no `.env` do pacote `api`:

| Provider     | `REALTIME_PROVIDER` | Variáveis adicionais                                                |
|--------------|---------------------|---------------------------------------------------------------------|
| Supabase     | `supabase`          | `SUPABASE_URL`, `SUPABASE_ANON_KEY`                                 |
| WebSocket    | `websocket`         | `WS_URL` (ex.: `ws://0.0.0.0:4001`)                                |
| Ably         | `ably`              | `ABLY_API_KEY`                                                      |
| Pusher       | `pusher`            | `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`    |
| Mock         | `mock`              | —                                                                   |

Dependências de cada provedor são **peer dependencies opcionais** — instale
apenas o que for usar:

```bash
# Supabase (padrão para a apresentação)
pnpm add @supabase/supabase-js --filter @mobiliza/api

# WebSocket (produção com infra própria do NAC)
pnpm add ws --filter @mobiliza/api

# Ably (alternativa gerenciada)
pnpm add ably --filter @mobiliza/api
```

---

## Uso no pacote `api` (server-side)

```typescript
import { createRealtimeAdapter } from '@mobiliza/realtime'

// Inicializa uma vez no bootstrap do servidor
const realtime = createRealtimeAdapter()

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

---

## Uso no app React Native / Next.js (client-side)

```typescript
// O client-side NÃO usa createRealtimeAdapter() — instancia diretamente
import { SupabaseClientAdapter } from '@mobiliza/realtime'

const adapter = new SupabaseClientAdapter({
  url: process.env.EXPO_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
})

// Em um hook React
useEffect(() => {
  const unsub = adapter.subscribe('sala:42', 'voto:registrado', (data) => {
    setVotos(prev => [...prev, data])
  })

  return () => {
    unsub()
  }
}, [salaId])
```

Para usar WebSocket em vez de Supabase no client:

```typescript
import { WebSocketClientAdapter } from '@mobiliza/realtime'

const adapter = new WebSocketClientAdapter({
  url: 'ws://seu-servidor.nac.br:4001',
  autoReconnect: true,
  reconnectInterval: 3000,
})
```

---

## Testes

O `MockRealtimeAdapter` (server) e o `MockClientAdapter` (client) permitem
testar fluxos de realtime sem nenhuma conexão externa:

```typescript
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

## Convenção de canais

Para manter consistência entre cliente e servidor, use o padrão:

```
{recurso}:{id}

sala:42           → eventos de uma sala específica
presenca:sala:42  → presença (quem está online)
usuario:abc       → eventos de um usuário específico
```

---

## Decisão arquitetural

Este pacote implementa o padrão **Adapter** — uma interface contratual que
abstrai o provedor de tempo real do restante da aplicação.

Vantagens:
- **Sem lock-in**: trocar de um provedor para outro é uma linha no `.env`
- **Testabilidade**: o `MockAdapter` elimina dependências externas nos testes
- **Demonstração acadêmica**: Supabase gratuito para a apresentação; WebSocket
  próprio para produção com infraestrutura do NAC
- **Coerência**: cliente (React Native) e servidor (API) compartilham as mesmas
  interfaces, mesmo que com implementações diferentes
