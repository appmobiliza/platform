/**
 * Mock simples do cliente de banco de dados (@mobiliza/db/client).
 *
 * Implementação direta que funciona com os routers sem modificá-los.
 */

import type * as schema from '@mobiliza/db/schema'
import { uuidv7 } from "uuidv7";

// ─── In-Memory Store ───────────────────────────────────────────────────────────

export const dbStore: Record<string, unknown[]> = {
  user: [],
  session: [],
  studentProfile: [],
  scholarProfile: [],
  studentDisability: [],
  campusLocation: [],
  serviceRequest: [],
  serviceAttendance: [],
  notification: [],
}

function ensureTable(tableName: string): void {
  if (!dbStore[tableName]) {
    dbStore[tableName] = []
  }
}

export function resetDB(): void {
  dbStore.user.length = 0
  dbStore.session.length = 0
  dbStore.studentProfile.length = 0
  dbStore.scholarProfile.length = 0
  dbStore.studentDisability.length = 0
  dbStore.campusLocation.length = 0
  dbStore.serviceRequest.length = 0
  dbStore.serviceAttendance.length = 0
  dbStore.notification.length = 0
}

export function seedUser(overrides: Partial<schema.User> = {}): schema.User {
  ensureTable('user')
  const user: schema.User = {
    id: uuidv7(),
    name: 'Test User',
    email: 'test@example.com',
    emailVerified: true,
    image: null,
    role: 'student',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
  dbStore.user.push(user)
  return user
}

export function seedScholarProfile(userId: string, overrides: Partial<schema.ScholarProfile> = {}): schema.ScholarProfile {
  ensureTable('scholarProfile')
  const profile: schema.ScholarProfile = {
    id: uuidv7(),
    userId,
    enrollment: '2024001',
    course: 'Ciência da Computação',
    campus: 'AC.Simões',
    phone: '82111112222',
    cpf: '12345678901',
    shift: 'morning',
    isApproved: false,
    approvedAt: null,
    approvedBy: null,
    isAvailable: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
  dbStore.scholarProfile.push(profile)
  return profile
}

export function seedStudentProfile(userId: string, overrides: Partial<schema.StudentProfile> = {}): schema.StudentProfile {
  ensureTable('studentProfile')
  const profile: schema.StudentProfile = {
    id: uuidv7(),
    userId,
    enrollment: '2024002',
    course: 'Ciência da Computação',
    campus: 'Campus A.C. Simões',
    phone: '82111113333',
    shift: 'morning',
    gender: 'male',
    nickname: null,
    attendanceNotes: null,
    simplifiedInterface: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
  dbStore.studentProfile.push(profile)
  return profile
}

export function seedCampusLocation(overrides: Partial<schema.CampusLocation> = {}): schema.CampusLocation {
  ensureTable('campusLocation')
  const location: schema.CampusLocation = {
    id: uuidv7(),
    name: 'Bloco de Aulas',
    abbreviation: 'BLA',
    description: 'Bloco principal de aulas',
    latitude: -9,
    longitude: -35,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
  dbStore.campusLocation.push(location)
  return location
}

export function seedServiceRequest(studentProfileId: string, overrides: Partial<schema.ServiceRequest> = {}): schema.ServiceRequest {
  ensureTable('serviceRequest')
  const request: schema.ServiceRequest = {
    id: uuidv7(),
    studentProfileId,
    originLocationId: 'loc_default_origin',
    destinationLocationId: 'loc_default_dest',
    status: 'pending',
    notes: null,
    respondedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
  dbStore.serviceRequest.push(request)
  return request
}

export function seedServiceAttendance(requestId: string, scholarProfileId: string, overrides: Partial<schema.ServiceAttendance> = {}): schema.ServiceAttendance {
  ensureTable('serviceAttendance')
  const attendance: schema.ServiceAttendance = {
    id: uuidv7(),
    requestId,
    scholarProfileId,
    acceptedAt: new Date(),
    startedAt: null,
    completedAt: null,
    durationSeconds: null,
    rating: null,
    ratingComment: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
  dbStore.serviceAttendance.push(attendance)
  return attendance
}

export function seedNotification(userId: string, overrides: Partial<schema.Notification> = {}): schema.Notification {
  ensureTable('notification')
  const notification: schema.Notification = {
    id: uuidv7(),
    userId,
    type: 'new_request_available',
    title: 'Nova solicitação',
    body: 'Uma nova solicitação foi criada',
    resourceId: null,
    readAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
  dbStore.notification.push(notification)
  return notification
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function normalizeTableName(name: string): string {
  // Drizzle uses snake_case (campus_location), dbStore uses camelCase (campusLocation)
  return name.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

function evalCondition(item: Record<string, unknown>, cond: unknown): boolean {
  if (!cond) return true
  if (typeof cond === 'function') return (cond as (i: Record<string, unknown>) => boolean)(item)

  if (typeof cond === 'object' && 'queryChunks' in cond) {
    const chunks = (cond as { queryChunks: unknown[] }).queryChunks
    for (const chunk of chunks) {
      if (chunk && typeof chunk === 'object') {
        if ('name' in chunk && !('value' in chunk)) {
          const col = (chunk as { name: string }).name
          for (const c of chunks) {
            if (c && typeof c === 'object' && 'value' in c && !('queryChunks' in c)) {
              return item[col] === (c as { value: unknown }).value
            }
          }
        }
      }
    }
    return true
  }

  if (typeof cond === 'object') {
    return Object.entries(cond as Record<string, unknown>).every(
      ([k, v]) => item[k] === v
    )
  }

  return true
}

function evalInCondition(item: Record<string, unknown>, cond: unknown): boolean {
  if (typeof cond !== 'object' || !cond || !('queryChunks' in cond)) return true
  const chunks = (cond as { queryChunks: unknown[] }).queryChunks
  for (const chunk of chunks) {
    if (chunk && typeof chunk === 'object' && 'value' in chunk && Array.isArray((chunk as { value: unknown }).value)) {
      const val = (chunk as { value: unknown[] }).value[0]
      if (typeof val === 'string' && val.includes(' IN (')) {
        const match = val.match(/^(\w+)\s+IN\s+\((.+)\)$/i)
        if (match) {
          const col = match[1]
          const vals = match[2].match(/'([^']+)'/g)?.map((v: string) => v.replace(/'/g, '')) ?? []
          return vals.includes(item[col] as string)
        }
      }
    }
  }
  return true
}

// ─── Query Builder Mock ──────────────────────────────────────────────────────

class MockQueryBuilder<T extends Record<string, unknown>> {
  private tableName: string
  private _where: Array<(item: T) => boolean> = []
  private _orderBy: Array<(a: T, b: T) => number> = []
  private _limit = 0
  private _offset = 0

  constructor(tableName: string) {
    this.tableName = normalizeTableName(tableName)
  }

  where(cond: unknown): this {
    if (cond) {
      this._where.push((item) => evalCondition(item, cond) && evalInCondition(item, cond))
    }
    return this
  }

  with(): this { return this }

  orderBy(orders: Array<(a: T, b: T) => number>): this {
    this._orderBy = orders
    return this
  }

  limit(n: number): this {
    this._limit = n
    return this
  }

  offset(n: number): this {
    this._offset = n
    return this
  }

  columns(): this { return this }

  async findFirst(): Promise<T | undefined> {
    if (process.env.DEBUG_TEST) {
      console.log(`[MockQueryBuilder] findFirst on ${this.tableName}`);
      console.log(`[MockQueryBuilder] _where filters: ${this._where.length}`);
      console.log(`[MockQueryBuilder] dbStore keys:`, Object.keys(dbStore));
      console.log(`[MockQueryBuilder] dbStore[${this.tableName}] length:`, (dbStore[this.tableName] as T[])?.length);
    }
    const data = dbStore[this.tableName] as T[]
    const result = data.filter((item) =>
      this._where.every((f) => f(item)),
    )
    if (process.env.DEBUG_TEST) {
      console.log(`[MockQueryBuilder] findFirst returning:`, result[0]);
    }
    return result[0]
  }

  async findMany(): Promise<T[]> {
    let result = dbStore[this.tableName] as T[]
    result = result.filter((item) =>
      this._where.every((f) => f(item)),
    )
    for (const o of this._orderBy) {
      result.sort(o)
    }
    if (this._limit > 0) {
      result = result.slice(this._offset, this._offset + this._limit)
    } else if (this._offset > 0) {
      result = result.slice(this._offset)
    }
    return result
  }

  async returning(): Promise<T[]> {
    return this.findMany()
  }
}
// ─── Insert Builder Mock ──────────────────────────────────────────────────────

class MockInsertBuilder<T extends Record<string, unknown>> {
  private tableName: string
  private _values: Partial<T>[] = []

  constructor(tableName: string) {
    this.tableName = normalizeTableName(tableName)
    ensureTable(this.tableName)
  }

  values(data: Partial<T> | Partial<T>[]): this {
    this._values = Array.isArray(data) ? data : [data]
    return this
  }

  async returning(): Promise<T[]> {
    if (process.env.DEBUG_TEST) {
      console.log(`[MockInsertBuilder] returning on ${this.tableName}, values:`, this._values);
      console.log(`[MockInsertBuilder] dbStore keys before:`, Object.keys(dbStore));
    }
    const result = this._values.map(v => ({ ...v } as T))
    ;(dbStore[this.tableName] as T[]).push(...result)
    if (process.env.DEBUG_TEST) {
      console.log(`[MockInsertBuilder] dbStore[${this.tableName}] now has:`, dbStore[this.tableName]?.length, 'items');
      console.log(`[MockInsertBuilder] dbStore keys after:`, Object.keys(dbStore));
    }
    return result
  }
}

// ─── Update Builder Mock ──────────────────────────────────────────────────────

class MockUpdateBuilder<T extends Record<string, unknown>> {
  private tableName: string
  private _where: Array<(item: T) => boolean> = []
  private _set: Partial<T> = {}

  constructor(tableName: string) {
    this.tableName = normalizeTableName(tableName)
    ensureTable(this.tableName)
  }

  set(data: Partial<T>): this {
    this._set = data
    return this
  }

  where(cond: unknown): this {
    if (cond) {
      this._where.push((item) => evalCondition(item, cond))
    }
    return this
  }

  async returning(): Promise<T[]> {
    const result: T[] = []
    const data = dbStore[this.tableName] as T[]
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      if (this._where.every(f => f(item))) {
        const updated = { ...item, ...this._set } as T
        data[i] = updated
        result.push(updated)
      }
    }
    return result
  }
}

// ─── Delete Builder Mock ──────────────────────────────────────────────────────

class MockDeleteBuilder<T extends Record<string, unknown>> {
  private tableName: string
  private _where: Array<(item: T) => boolean> = []

  constructor(tableName: string) {
    this.tableName = normalizeTableName(tableName)
    ensureTable(this.tableName)
  }

  where(cond: unknown): this {
    if (cond) {
      this._where.push((item) => evalCondition(item, cond))
    }
    return this
  }

  async returning(): Promise<T[]> {
    const result: T[] = []
    const data = dbStore[this.tableName] as T[]
    for (let i = data.length - 1; i >= 0; i--) {
      const item = data[i]
      if (this._where.every(f => f(item))) {
        result.push(item)
        data.splice(i, 1)
      }
    }
    return result
  }
}

// ─── Select Builder Mock ──────────────────────────────────────────────────────

class MockSelectBuilder {
  private _tableName = ''
  private _whereFn: ((item: Record<string, unknown>) => boolean) | null = null

  from(table: unknown): this {
    const name = typeof table === 'function' ? table.name : String(table).replace(/'/g, '');
    this._tableName = normalizeTableName(name);
    ensureTable(this._tableName)
    return this;
  }

  where(cond: unknown): this {
    if (cond) {
      this._whereFn = (item) => evalCondition(item, cond)
    }
    return this
  }

  select(): this { return this }
  groupBy(): this { return this }
  orderBy(): this { return this }
  limit(): this { return this }

  async then(resolve: (val: unknown) => void, _reject: (val: unknown) => void): Promise<void> {
    resolve([])
  }
}

// ─── Transaction Mock ─────────────────────────────────────────────────────────

class MockTransaction {
  async query(_sql: unknown): Promise<unknown[]> {
    return []
  }

  async rollback(): Promise<void> {}
}

// ─── Query Tables ────────────────────────────────────────────────────────────

// Reuse the MockQueryBuilder for query tables to properly handle WHERE conditions
function createQueryTable(tableName: string) {
  return {
    findFirst: async (params?: { where?: unknown }): Promise<Record<string, unknown> | undefined> => {
      ensureTable(tableName)
      const builder = new MockQueryBuilder<Record<string, unknown>>(tableName)
      if (params?.where) {
        builder.where(params.where)
      }
      return builder.findFirst()
    },
    findMany: async (params?: { where?: unknown }): Promise<Record<string, unknown>[]> => {
      ensureTable(tableName)
      const builder = new MockQueryBuilder<Record<string, unknown>>(tableName)
      if (params?.where) {
        builder.where(params.where)
      }
      return builder.findMany()
    },
  }
}

// ─── Mock DB Principal ────────────────────────────────────────────────────────

export const db = {
  query: {
    user: createQueryTable('user'),
    session: createQueryTable('session'),
    studentProfile: createQueryTable('studentProfile'),
    scholarProfile: createQueryTable('scholarProfile'),
    studentDisability: createQueryTable('studentDisability'),
    campusLocation: createQueryTable('campusLocation'),
    serviceRequest: createQueryTable('serviceRequest'),
    serviceAttendance: createQueryTable('serviceAttendance'),
    notification: createQueryTable('notification'),
  },

  insert: (table: unknown) => {
    // Handle both string table names and Drizzle table objects
    let name: string;
    if (typeof table === 'function') {
      name = table.name;
    } else if (typeof table === 'object' && table !== null) {
      // Drizzle table object - extract name from Symbol
      const tableObj = table as Record<string | symbol, unknown>;
      name = String(table).replace(/'/g, '') || 'unknown'; // default before symbol lookup
      const symbols = Object.getOwnPropertySymbols(tableObj);
      for (const sym of symbols) {
        const desc = sym.description || '';
        if (desc === 'drizzle:Name' || desc === 'drizzle:OriginalName') {
          name = String(tableObj[sym]);
          break;
        }
      }
      // Also check 'name' property as fallback
      if (name === 'unknown' && 'name' in tableObj && typeof tableObj.name === 'string') {
        name = tableObj.name;
      }
    } else {
      name = String(table).replace(/'/g, '');
    }
    return new MockInsertBuilder(name);
  },

  update: (table: unknown) => {
    const name = typeof table === 'function' ? table.name : String(table).replace(/'/g, '');
    return new MockUpdateBuilder(name);
  },

  delete: (table: unknown) => {
    const name = typeof table === 'function' ? table.name : String(table).replace(/'/g, '');
    return new MockDeleteBuilder(name);
  },

  select: () => new MockSelectBuilder(),

  transaction: async <T>(fn: (tx: MockTransaction) => Promise<T>): Promise<T> => fn(new MockTransaction()),
} as unknown as typeof import('@mobiliza/db/client')['db']

export const mockDb = db
export function setupDBMocks(): void {}
