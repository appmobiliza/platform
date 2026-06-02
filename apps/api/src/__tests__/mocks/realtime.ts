/**
 * Mock do módulo @mobiliza/realtime
 *
 * Simula o RealtimeAdapter para testes unitários.
 * Todos os métodos são no-ops — não tenta conexão real.
 */

import type { RealtimeAdapter, RealtimeClientAdapter } from '@mobiliza/realtime'

/**
 * Mock do RealtimeAdapter server-side.
 */
export class MockRealtimeAdapter implements RealtimeAdapter {
	publish = jest.fn(async () => { })
	subscribe = jest.fn(() => {
		return () => { }
	})
	unsubscribe = jest.fn(async () => { })
	disconnect = jest.fn(async () => { })
}

/**
 * Mock do RealtimeClientAdapter client-side.
 */
export class MockClientRealtimeAdapter implements RealtimeClientAdapter {
	subscribe = jest.fn(() => {
		return () => { }
	})
	disconnect = jest.fn(async () => { })
}

// ─── Factory ──────────────────────────────────────────────────────────────────

let adapterInstance: MockRealtimeAdapter | null = null

export function createMockRealtimeAdapter(): RealtimeAdapter {
	if (!adapterInstance) {
		adapterInstance = new MockRealtimeAdapter()
	}
	return adapterInstance
}

export function resetMockRealtimeAdapter(): void {
	adapterInstance = null
}

// ─── Re-export types (para uso nos mocks) ─────────────────────────────────────

export type { RealtimeAdapter, RealtimeClientAdapter } from '@mobiliza/realtime'
