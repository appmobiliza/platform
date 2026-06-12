import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth/web-cookie";

/**
 * Limpa o cookie de sessão assinado do Next.js.
 *
 * Chamado pelo frontend após o logout no Better Auth para garantir
 * que o cookie web não fique válido mesmo depois da sessão revogada.
 */
export async function POST() {
	const response = NextResponse.json({ success: true });
	response.cookies.set(SESSION_COOKIE_NAME, "", {
		httpOnly: true,
		secure: true,
		sameSite: "lax",
		maxAge: 0,
		path: "/",
	});
	return response;
}
