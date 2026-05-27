import { z } from "zod";
import { db } from "@mobiliza/db/client";

// ─── Schemas de validação ─────────────────────────────────────────────────────

export const createRequestInput = z.object({
  originLocationId: z.number().int().positive(),
  destinationLocationId: z.number().int().positive(),
  notes: z.string().max(500).optional(),
});

export const paginationInput = z.object({
  limit: z.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(), // id da última solicitação vista
});

// ─── Helpers internos ─────────────────────────────────────────────────────────

export const execTx = (globalThis as Record<string, unknown>).mockTransaction
  ? (globalThis as Record<string, (cb: (tx: typeof db) => Promise<any>) => Promise<any>>).mockTransaction
  : ((cb: (tx: typeof db) => Promise<any>) => db.transaction(cb));

/** Gera um ID de request no formato `req_<timestamp>_<random>` */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function generateAttendanceId(): string {
  return `att_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
