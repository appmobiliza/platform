/**
 * Mock do módulo @mobiliza/auth
 *
 * Simula o Better Auth para testes unitários.
 * Não faz chamadas reais ao banco ou serviços externos.
 */

import { jest } from "@jest/globals";
import { uuidv7 } from "uuidv7";

/**
 * Mock do Better Auth — retorna sessões simuladas.
 */
export const auth = {
	handler: jest.fn(async (_request: Request) => {
		return new Response(JSON.stringify({ status: "ok" }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	}),

	api: {
		getSession: jest.fn(async ({ headers }: { headers: Headers }) => {
			// Por padrão, retorna null (não autenticado)
			// Os testes podem sobrescrever isso
			return null;
		}),
		getUser: jest.fn(async () => null),
		signOut: jest.fn(async () => ({ success: true })),
	},
};

// ─── Helpers para mockar sessão nos testes ────────────────────────────────────

export interface MockSession {
	user: {
		id: string;
		name: string;
		email: string;
		role: "student" | "scholar" | "manager";
		image?: string | null;
	};
	session: {
		id: string;
		expiresAt: Date;
	};
}

export function createMockSession(
	overrides: Partial<MockSession["user"]> = {},
): MockSession {
	return {
		user: {
			id: uuidv7(),
			name: "Test User",
			email: "test@example.com",
			role: "student",
			image: null,
			...overrides,
		},
		session: {
			id: uuidv7(),
			expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
		},
	};
}

export function mockAuthSession(session: MockSession | null): void {
	(auth.api.getSession as jest.Mock).mockResolvedValue(session);
}

export function clearAuthMock(): void {
	(auth.api.getSession as jest.Mock).mockResolvedValue(null);
	(auth.handler as jest.Mock).mockReset();
	(auth.api.getUser as jest.Mock).mockReset();
	(auth.api.signOut as jest.Mock).mockReset();
}
