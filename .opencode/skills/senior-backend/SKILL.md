---
name: senior-backend
description: Backend development skill specialized for Mobiliza project. Building scalable systems using tRPC v11, Drizzle ORM, PostgreSQL (Neon), Clean Architecture (contracts → domain → api), and WebSockets for real-time features.
metadata:
  author: Mobiliza Team
  version: '1.0.0'
  project: Mobiliza - UFAL Mobility System
---

# Senior Backend Architect — Mobiliza Special Edition

## Project Context

You are working on **Mobiliza**, a mobility assistance system for students with disabilities (PcD) at UFAL. The system replaces manual WhatsApp-based coordination with a digital platform.

### Architecture Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  App Mobile │     │  Dashboard  │     │   Backend   │
│  (students  │     │    Web      │     │   (tRPC)    │
│  & bolsistas│     │   (NAC)     │     │             │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                    ┌──────▼──────┐
                    │  PostgreSQL │
                    │   (Neon)    │
                    └─────────────┘
```

### Project Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| TypeScript | 5.9+ (strict) | Language |
| tRPC | v11 | API layer |
| Drizzle ORM | 0.30+ | Database ORM |
| PostgreSQL | via Neon | Database (serverless) |
| Zod | latest | Validation |
| WebSockets | ws package | Real-time |

### Repository Structure

```
platform/
├── apps/
│   ├── api/              # tRPC Server
│   │   └── src/
│   │       ├── trpc/     # Routers (ORQUESTRAÇÃO ONLY)
│   │       │   └── routers/
│   │       ├── routes/   # REST adapters (if needed)
│   │       └── server.ts
│   └── web/              # Next.js Dashboard
├── packages/
│   ├── contracts/        # Zod schemas (VALIDAÇÃO ÚNICA)
│   ├── db/               # Drizzle ORM + migrations
│   ├── domain/           # REGRAS DE NEGÓCIO (lógica pura)
│   ├── realtime/         # WebSockets/eventos
│   └── ui/               # Componentes compartilhados
└── .specs/               # Documentação SDD
```

---

## PART 1: CLEAN ARCHITECTURE (Mobiliza Pattern)

### The Golden Rule

**Dependencies flow in ONE direction:**

```
contracts (Zod schemas) → domain (pure logic) → api (tRPC routers)
```

**N EVER reverse this flow.**

### Where to Put Code

| Layer | Location | What Goes There |
|-------|----------|-----------------|
| **Contracts** | `packages/contracts/src/` | Zod schemas, validation |
| **Domain** | `packages/domain/src/` | Business logic, pure functions |
| **API** | `apps/api/src/trpc/routers/` | Orchestration, delegação |
| **DB** | `packages/db/src/` | Drizzle schemas, migrations |

### Example: Creating a Request

**1. contracts/ — Source of Truth**

```typescript
// packages/contracts/src/requests.ts
import { z } from 'zod';

export const RequestStatusSchema = z.enum([
  'PENDING',
  'SEARCHING_ASSISTANT',
  'ASSIGNED',
  'AWAITING_ACCEPTANCE',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'REASSIGNING',
]);

export const CreateRequestSchema = z.object({
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  studentId: z.string().uuid(),
});

export const UpdateRequestSchema = z.object({
  id: z.string().uuid(),
  status: RequestStatusSchema.optional(),
  assistantId: z.string().uuid().optional(),
});
```

**2. domain/ — Business Logic (Pure)**

```typescript
// packages/domain/src/requests/create-request.ts
import { CreateRequestSchema } from '@mobiliza/contracts';
import type { Database } from '@mobiliza/db';
import { requests } from '@mobiliza/db/schema';
import { eq } from 'drizzle-orm';
import { ConflictError, NotFoundError } from '../errors';

export async function createRequest(
  input: z.infer<typeof CreateRequestSchema>,
  db: Database
): Promise<{ id: string; status: string }> {
  // Validation is optional here if already validated at router level
  const data = CreateRequestSchema.parse(input);

  // Business rules
  const existingRequest = await db.query.requests.findFirst({
    where: eq(requests.studentId, data.studentId),
    where: eq(requests.status, 'PENDING'),
  });

  if (existingRequest) {
    throw new ConflictError('Student already has a pending request');
  }

  // Insert
  const [created] = await db.insert(requests).values({
    origin: data.origin,
    destination: data.destination,
    studentId: data.studentId,
    status: 'PENDING',
    createdAt: new Date(),
  }).returning({ id: requests.id, status: requests.status });

  return created;
}
```

**3. api/ — Orchestration Only**

```typescript
// apps/api/src/trpc/routers/requests.ts
import { publicProcedure, router } from '../trpc';
import { createRequest } from '@mobiliza/domain';
import { CreateRequestSchema } from '@mobiliza/contracts';

export const requestsRouter = router({
  create: publicProcedure
    .input(CreateRequestSchema)
    .mutation(async ({ input, ctx }) => {
      return createRequest(input, ctx.db);
    }),
});
```

---

## PART 2: TRPC v11 SPECIFIC

### Router Structure

```typescript
import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);

// Middleware for auth
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});
```

### Error Handling

```typescript
import { TRPCError } from '@trpc/server';

throw new TRPCError({
  code: 'NOT_FOUND',
  message: 'Request with ID not found',
  cause: { requestId },
});
```

### Request Types

| HTTP Method | tRPC Type | Use Case |
|-------------|-----------|----------|
| GET | `.query()` | Fetch data |
| POST | `.mutation()` | Create data |
| PUT/PATCH | `.mutation()` | Update data |
| DELETE | `.mutation()` | Delete data |

---

## PART 3: DRIZZLE ORM + NEON POSTGRES

### Schema Definition

```typescript
// packages/db/src/schema/requests.ts
import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const requestStatusEnum = pgEnum('request_status', [
  'PENDING',
  'SEARCHING_ASSISTANT',
  'ASSIGNED',
  'AWAITING_ACCEPTANCE',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'REASSIGNING',
]);

export const requests = pgTable('requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id').notNull().references(() => students.id),
  assistantId: uuid('assistant_id').references(() => assistants.id),
  origin: text('origin').notNull(),
  destination: text('destination').notNull(),
  status: requestStatusEnum('status').default('PENDING'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});
```

### Migrations

```bash
# Generate migration
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Studio (visual editor)
pnpm db:studio
```

### Query Patterns

```typescript
// Using Drizzle query builder
const result = await db.query.requests.findMany({
  where: eq(requests.status, 'PENDING'),
  with: {
    student: true,
    assistant: true,
  },
});

// Using raw SQL (only when necessary)
import { sql } from 'drizzle-orm';
const count = await db.execute(sql`SELECT COUNT(*) FROM requests`);
```

---

## PART 4: REALTIME (WebSockets)

### Implementation Pattern

```typescript
// packages/realtime/src/index.ts
import { Server } from 'socket.io';

export function createRealtimeServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: { origin: process.env.NEXT_PUBLIC_APP_URL },
  });

  io.on('connection', (socket) => {
    // Join room for specific request
    socket.on('join:request', (requestId: string) => {
      socket.join(`request:${requestId}`);
    });

    // Emit location update
    socket.on('location:update', (data: LocationUpdate) => {
      io.to(`request:${data.requestId}`).emit('location:changed', data);
    });
  });

  return io;
}
```

### Usage in Domain

```typescript
// Emit from domain (or use event-driven pattern)
export async function createRequest(input, db, emitEvent: EmitEvent) {
  // ... create request ...

  // Emit real-time event
  emitEvent('request:created', { requestId: created.id });

  return created;
}
```

---

## PART 5: REQUEST LIFECYCLE (State Machine)

```
PENDING
  ↓
SEARCHING_ASSISTANT
  ↓
ASSIGNED
  ↓
AWAITING_ACCEPTANCE
  ↓ (accept)          ↓ (timeout/recuse)
IN_PROGRESS ←──────── REASSIGNING
  ↓
COMPLETED
  ↓ (cancel)
CANCELLED
```

### Status Transitions

| Current State | Trigger | Next State |
|---------------|---------|------------|
| PENDING | Matching finds assistant | SEARCHING_ASSISTANT |
| SEARCHING_ASSISTANT | Assistant found | ASSIGNED |
| ASSIGNED | Assistant accepts | AWAITING_ACCEPTANCE |
| AWAITING_ACCEPTANCE | Accept timeout | REASSIGNING |
| AWAITING_ACCEPTANCE | Assistant accepts | IN_PROGRESS |
| IN_PROGRESS | Student marks complete | COMPLETED |
| Any (except COMPLETED) | Cancel by user | CANCELLED |

---

## PART 6: API DESIGN GUIDELINES

### Naming Conventions

| Pattern | Example |
|---------|---------|
| Router name | `requestsRouter` |
| Procedure name | `requests.list`, `requests.create` |
| Schema name | `CreateRequestSchema`, `RequestSchema` |
| Table name | `requests`, `students` |

### Versioning

```typescript
// Current: v1
export const requestsRouterV1 = router({ ... });

// Future: v2 for breaking changes
export const requestsRouterV2 = router({ ... });
```

### Pagination

```typescript
// Cursor-based pagination
export const listRequests = publicProcedure
  .input(z.object({
    cursor: z.string().optional(),
    limit: z.number().min(1).max(100).default(20),
  }))
  .query(async ({ input, ctx }) => {
    const results = await ctx.db.query.requests.findMany({
      limit: input.limit + 1,
      cursor: input.cursor ? { id: input.cursor } : undefined,
    });

    const hasMore = results.length > input.limit;
    const items = hasMore ? results.slice(0, -1) : results;

    return {
      items,
      nextCursor: hasMore ? items[items.length - 1].id : undefined,
    };
  });
```

---

## PART 7: SECURITY

### Authentication (Future)

```typescript
// Middleware for JWT validation
const isAuthed = t.middleware(async ({ ctx, next }) => {
  const token = ctx.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const user = await verifyJWT(token);
  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({ ctx: { ...ctx, user } });
});
```

### Input Validation

**Always use Zod schemas from contracts:**

```typescript
// ✅ CORRETO
publicProcedure
  .input(CreateRequestSchema) // from contracts
  .mutation(...)

// ❌ ERRADO
publicProcedure
  .input(z.object({ origin: z.string() })) // duplicating
  .mutation(...)
```

---

## PART 8: ERROR CLASSES (Domain)

```typescript
// packages/domain/src/errors/index.ts

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} with ID '${id}' not found`, 'NOT_FOUND', 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
  }
}
```

---

## PART 9: COMMON TASKS

### Creating a New Feature

```
1. packages/contracts/src/ → Add Zod schema
2. packages/domain/src/ → Add business logic function
3. packages/db/src/schema/ → Add Drizzle schema (if new table)
4. apps/api/src/trpc/routers/ → Add tRPC router
5. apps/api/src/trpc/trpc.ts → Register router
```

### Adding a Migration

```bash
# 1. Modify schema in packages/db/src/schema/
# 2. Generate migration
pnpm --filter @mobiliza/db generate

# 3. Review migration file in packages/db/drizzle/
# 4. Apply
pnpm --filter @mobiliza/db migrate
```

### Testing Domain Functions

```typescript
// packages/domain/src/__tests__/create-request.test.ts
import { createRequest } from '../requests/create-request';
import { createMockDb } from '../__tests__/helpers';

describe('createRequest', () => {
  it('should create request with PENDING status', async () => {
    const mockDb = createMockDb();
    const input = { origin: 'IC', destination: 'RU', studentId: 'uuid' };

    const result = await createRequest(input, mockDb);

    expect(result.status).toBe('PENDING');
  });
});
```

---

## PART 10: COMMANDS REFERENCE

```bash
# API Development
pnpm --filter api dev          # Start API dev server
pnpm --filter api build        # Build API
pnpm --filter api lint         # Lint API
pnpm --filter api check-types  # Type check

# Database
pnpm --filter @mobiliza/db generate   # Generate migrations
pnpm --filter @mobiliza/db migrate     # Apply migrations
pnpm --filter @mobiliza/db studio      # Open Drizzle Studio

# All
pnpm dev                       # Dev all apps
pnpm build                     # Build all
pnpm lint                      # Lint all
pnpm test                      # Test all
```

---

## ANTI-PATTERNS (Never Do)

❌ **Logic in tRPC routers** — Go to domain
❌ **Duplicating validation** — Use contracts
❌ **Raw SQL in routers** — Use Drizzle query builder
❌ **Circular dependencies** — contracts → domain → api
❌ **Hardcoding strings** — Use constants
❌ **Any secrets in code** — Use .env

---

*Backend for Mobiliza — Accessibility, Privacy, Traceability.*