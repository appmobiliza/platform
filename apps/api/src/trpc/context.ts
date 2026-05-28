/**
 * Configuração central do tRPC para o Mobiliza.
 *
 * Aqui ficam:
 * - O tipo de `context` que todas as procedures recebem
 * - A instância `t` do tRPC
 * - As procedures base reutilizáveis (public, protected, scholar, manager)
 *
 * A hierarquia de procedures:
 *   publicProcedure   → qualquer um
 *   protectedProcedure → sessão válida (qualquer role)
 *   scholarProcedure  → role === "scholar" (aprovado ou não)
 *   managerProcedure  → role === "manager"
 */

import { auth } from "@mobiliza/db/auth";
import type { RealtimeAdapter } from "@mobiliza/realtime";
import { createRealtimeAdapter } from "@mobiliza/realtime";
import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "hono";
import type { OpenApiMeta } from 'trpc-to-openapi';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type UserRole = "student" | "scholar" | "manager";

export interface Session {
	user: {
		id: string;
		name: string;
		email: string;
		role: UserRole;
		image?: string | null;
	};
	session: {
		id: string;
		expiresAt: Date;
	};
}

/**
 * Contexto disponível em todas as procedures do tRPC.
 *
 * `session` é `null` em procedures públicas — use `protectedProcedure`
 * para garantir que o contexto sempre tenha sessão.
 */
export interface TRPCContext extends Record<string, unknown> {
	session: Session | null;
	realtime: RealtimeAdapter;
	/** Headers originais do request — necessários para o Better Auth */
	headers: Headers;
}

// ─── Singleton do adapter de realtime ────────────────────────────────────────

/**
 * O adapter de realtime é criado uma vez e reutilizado em todas as
 * requisições. Não crie um novo adapter por request — o WebSocket adapter,
 * por exemplo, mantém um servidor aberto.
 */
let _realtime: RealtimeAdapter | null = null;

export function getRealtimeAdapter(): RealtimeAdapter {
  if (!_realtime) {
    _realtime = createRealtimeAdapter();
  }
  return _realtime;
}

// ─── Factory de contexto ──────────────────────────────────────────────────────

/**
 * Cria o contexto do tRPC a partir de um request Hono.
 * Chamado uma vez por requisição pelo adaptador Hono-tRPC.
 */
export async function createTRPCContext(c: Context): Promise<TRPCContext> {
	const headers = new Headers(c.req.raw.headers);

	// O Better Auth valida o cookie/token de sessão nos headers
	const session = await auth.api.getSession({ headers }).catch(() => null);

	return {
		session: session as Session | null,
		realtime: getRealtimeAdapter(),
		headers,
	};
}

// ─── Instância do tRPC ────────────────────────────────────────────────────────

const t = initTRPC.meta<OpenApiMeta>().context<TRPCContext>().create({
	/**
	 * Transforma erros antes de enviá-los ao cliente.
	 * Remove stack traces em produção e padroniza o formato.
	 */
	errorFormatter({ shape, error }) {
		return {
			...shape,
			data: {
				...shape.data,
				// Stack trace apenas em desenvolvimento
				stack:
					process.env.NODE_ENV === "development"
						? error.stack
						: undefined,
			},
		};
	},
});

export const router = t.router;
export const middleware = t.middleware;

// ─── Middleware de autenticação ───────────────────────────────────────────────

const isAuthenticated = t.middleware(({ ctx, next }) => {
	if (!ctx.session) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message:
				"Você precisa estar autenticado para acessar este recurso.",
		});
	}
	return next({ ctx: { ...ctx, session: ctx.session } });
});

const isScholar = t.middleware(({ ctx, next }) => {
	if (!ctx.session) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}
	if (ctx.session.user.role !== "scholar") {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Apenas bolsistas podem acessar este recurso.",
		});
	}
	return next({ ctx: { ...ctx, session: ctx.session } });
});

const isManager = t.middleware(({ ctx, next }) => {
	if (!ctx.session) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}
	if (ctx.session.user.role !== "manager") {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Apenas gestores podem acessar este recurso.",
		});
	}
	return next({ ctx: { ...ctx, session: ctx.session } });
});

// ─── Procedures exportadas ────────────────────────────────────────────────────

/** Acessível sem autenticação — ex.: listar locais do campus */
export const publicProcedure = t.procedure;

/** Exige sessão válida — role pode ser qualquer uma */
export const protectedProcedure = t.procedure.use(isAuthenticated);

/** Exige role === "scholar" */
export const scholarProcedure = t.procedure.use(isScholar);

/** Exige role === "manager" */
export const managerProcedure = t.procedure.use(isManager);
