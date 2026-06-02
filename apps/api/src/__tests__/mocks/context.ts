/**
 * Mock do TRPC context para testes.
 *
 * Permite criar contexto com sessão simulada para testar
 * procedures protegidas.
 */

import { jest } from '@jest/globals'
import type { TRPCContext, Session } from '../../trpc/context'

export function createMockTRPCContext(overrides: Partial<TRPCContext> = {}): TRPCContext {
  const defaultSession: Session = {
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      role: 'student',
      image: null,
    },
    session: {
      id: 'test-session-id',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  }

  return {
    session: defaultSession,
    realtime: {
      publish: jest.fn(async () => {}),
      subscribe: jest.fn(() => () => {}),
      unsubscribe: jest.fn(async () => {}),
      disconnect: jest.fn(async () => {}),
    },
    headers: new Headers(),
    ...overrides,
  }
}

export function createNullSessionContext(): TRPCContext {
  return {
    session: null,
    realtime: {
      publish: jest.fn(async () => {}),
      subscribe: jest.fn(() => () => {}),
      unsubscribe: jest.fn(async () => {}),
      disconnect: jest.fn(async () => {}),
    },
    headers: new Headers(),
  }
}

export function createStudentSession(overrides: Partial<Session['user']> = {}): TRPCContext {
  return createMockTRPCContext({
    session: {
      user: {
        id: 'student-user-id',
        name: 'Student User',
        email: 'student@example.com',
        role: 'student',
        image: null,
        ...overrides,
      },
      session: {
        id: 'student-session-id',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    },
  })
}

export function createScholarSession(overrides: Partial<Session['user']> = {}): TRPCContext {
  return createMockTRPCContext({
    session: {
      user: {
        id: 'scholar-user-id',
        name: 'Scholar User',
        email: 'scholar@example.com',
        role: 'scholar',
        image: null,
        ...overrides,
      },
      session: {
        id: 'scholar-session-id',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    },
  })
}

export function createManagerSession(overrides: Partial<Session['user']> = {}): TRPCContext {
  return createMockTRPCContext({
    session: {
      user: {
        id: 'manager-user-id',
        name: 'Manager User',
        email: 'manager@example.com',
        role: 'manager',
        image: null,
        ...overrides,
      },
      session: {
        id: 'manager-session-id',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    },
  })
}