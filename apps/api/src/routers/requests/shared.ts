import { db } from "@mobiliza/db/client";

// ─── Schemas de validação ─────────────────────────────────────────────────────

export {
	CreateRequestSchema as createRequestInput,
	PaginationSchema as paginationInput,
} from "@mobiliza/contracts";

// ─── Helpers internos ─────────────────────────────────────────────────────────

export const execTx: <T>(cb: (tx: typeof db) => Promise<T>) => Promise<T> = (
	globalThis as any
).mockTransaction
	? (globalThis as any).mockTransaction
	: (cb: any) => db.transaction(cb);


