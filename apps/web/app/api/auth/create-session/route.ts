import { type NextRequest, NextResponse } from "next/server";

import {
	createSessionCookieValue,
	SESSION_COOKIE_MAX_AGE,
	SESSION_COOKIE_NAME,
} from "@/lib/auth/web-cookie";

/**
 * Cria o cookie de sessão assinado do Next.js.
 *
 * Chamado pelo front-end depois de obter a sessão via Better Auth
 * (que tem o cookie de sessão no domínio da API). Aceita os dados
 * de sessão e devolve um cookie assinado válido por 15 min.
 *
 * O body deve conter { userId, role }.
 */
export async function POST(request: NextRequest) {
	try {
		const body = (await request.json()) as {
			userId?: string;
			role?: string;
		};

		if (!body.userId || !body.role) {
			return NextResponse.json(
				{ error: "userId e role são obrigatórios" },
				{ status: 400 },
			);
		}

		const cookieValue = await createSessionCookieValue(
			body.userId,
			body.role,
		);

		const response = NextResponse.json({ success: true });
		response.cookies.set(SESSION_COOKIE_NAME, cookieValue, {
			httpOnly: true,
			secure: true,
			sameSite: "lax",
			maxAge: SESSION_COOKIE_MAX_AGE,
			path: "/",
		});

		return response;
	} catch (error) {
		console.error("[create-session] Erro ao criar cookie:", error);
		return NextResponse.json(
			{ error: "Erro interno ao criar sessão" },
			{ status: 500 },
		);
	}
}
