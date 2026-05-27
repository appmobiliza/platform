import { z } from "zod";
import { db } from "@mobiliza/db/client";

// ─── Schemas de validação ─────────────────────────────────────────────────────

export { CreateRequestSchema as createRequestInput, PaginationSchema as paginationInput } from "@mobiliza/contracts";

// ─── Helpers internos ─────────────────────────────────────────────────────────

export const execTx: <T>(cb: (tx: typeof db) => Promise<T>) => Promise<T> = 
  (globalThis as any).mockTransaction
    ? (globalThis as any).mockTransaction
    : ((cb: any) => db.transaction(cb));

/** Gera um ID de request no formato `req_<timestamp>_<random>` */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function generateAttendanceId(): string {
  return `att_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
