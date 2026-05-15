import { MockRealtimeAdapter } from '../adapters/server/mock'
import { MockClientAdapter } from '../adapters/client/mock'

// ─── MockRealtimeAdapter (server-side) ───────────────────────────────────────

describe('MockRealtimeAdapter', () => {
  let adapter: MockRealtimeAdapter

  beforeEach(() => {
    adapter = new MockRealtimeAdapter()
  })

  afterEach(async () => {
    await adapter.disconnect()
  })

  it('deve registrar um evento publicado no histórico', async () => {
    await adapter.publish('sala:1', 'user:joined', { userId: 'abc' })

    expect(adapter.published).toHaveLength(1)
    expect(adapter.published[0]).toEqual({
      channel: 'sala:1',
      event: 'user:joined',
      data: { userId: 'abc' },
    })
  })

  it('deve chamar o handler ao publicar no canal correto', async () => {
    const handler = jest.fn()
    adapter.subscribe('sala:1', 'user:joined', handler)

    await adapter.publish('sala:1', 'user:joined', { userId: 'abc' })

    expect(handler).toHaveBeenCalledOnce()
    expect(handler).toHaveBeenCalledWith({ userId: 'abc' })
  })

  it('não deve chamar o handler de outro canal', async () => {
    const handler = jest.fn()
    adapter.subscribe('sala:2', 'user:joined', handler)

    await adapter.publish('sala:1', 'user:joined', { userId: 'abc' })

    expect(handler).not.toHaveBeenCalled()
  })

  it('não deve chamar o handler após cancelar a inscrição', async () => {
    const handler = jest.fn()
    const unsub = adapter.subscribe('sala:1', 'user:joined', handler)
    unsub()

    await adapter.publish('sala:1', 'user:joined', { userId: 'abc' })

    expect(handler).not.toHaveBeenCalled()
  })

  it('deve suportar múltiplos handlers no mesmo canal/evento', async () => {
    const h1 = jest.fn()
    const h2 = jest.fn()
    adapter.subscribe('sala:1', 'voto', h1)
    adapter.subscribe('sala:1', 'voto', h2)

    await adapter.publish('sala:1', 'voto', { valor: 5 })

    expect(h1).toHaveBeenCalledOnce()
    expect(h2).toHaveBeenCalledOnce()
  })

  it('deve remover todos os handlers ao chamar unsubscribe(channel)', async () => {
    const handler = jest.fn()
    adapter.subscribe('sala:1', 'voto', handler)
    await adapter.unsubscribe('sala:1')

    await adapter.publish('sala:1', 'voto', { valor: 5 })

    expect(handler).not.toHaveBeenCalled()
  })

  it('deve limpar tudo ao chamar disconnect()', async () => {
    const handler = jest.fn()
    adapter.subscribe('sala:1', 'voto', handler)
    await adapter.publish('sala:1', 'voto', { valor: 3 })

    await adapter.disconnect()

    expect(adapter.published).toHaveLength(0)
    expect(adapter.listenerCount('sala:1', 'voto')).toBe(0)
  })

  it('clearPublished deve limpar apenas o histórico', async () => {
    const handler = jest.fn()
    adapter.subscribe('sala:1', 'voto', handler)
    await adapter.publish('sala:1', 'voto', { valor: 3 })

    adapter.clearPublished()

    expect(adapter.published).toHaveLength(0)
    // Handler ainda registrado
    await adapter.publish('sala:1', 'voto', { valor: 7 })
    expect(handler).toHaveBeenCalledTimes(2)
  })
})

// ─── MockClientAdapter (client-side) ─────────────────────────────────────────

describe('MockClientAdapter', () => {
  let adapter: MockClientAdapter

  beforeEach(() => {
    adapter = new MockClientAdapter()
  })

  afterEach(() => {
    adapter.disconnect()
  })

  it('deve chamar o handler ao simular um evento', () => {
    const handler = jest.fn()
    adapter.subscribe('sala:42', 'user:joined', handler)

    adapter.simulateEvent('sala:42', 'user:joined', { userId: 'xyz' })

    expect(handler).toHaveBeenCalledWith({ userId: 'xyz' })
  })

  it('o retorno de subscribe deve cancelar a inscrição', () => {
    const handler = jest.fn()
    const unsub = adapter.subscribe('sala:42', 'user:joined', handler)
    unsub()

    adapter.simulateEvent('sala:42', 'user:joined', { userId: 'xyz' })

    expect(handler).not.toHaveBeenCalled()
  })

  it('disconnect deve limpar todos os listeners', () => {
    const handler = jest.fn()
    adapter.subscribe('sala:42', 'user:joined', handler)

    adapter.disconnect()
    adapter.simulateEvent('sala:42', 'user:joined', { userId: 'xyz' })

    expect(handler).not.toHaveBeenCalled()
  })
})
