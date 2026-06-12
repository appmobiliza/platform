import { apiBaseUrl } from "@mobiliza/env/base-url";

import { type NextRequest, NextResponse } from "next/server";

import {
	createSessionCookieValue,
	SESSION_COOKIE_MAX_AGE,
	SESSION_COOKIE_NAME,
	verifySessionCookieValue,
} from "@/lib/auth/web-cookie";

const BETTER_AUTH_SESSION_COOKIE = "better-auth.session_token";

/**
 * Define o cookie de sessão assinado na resposta.
 */
function setSessionCookie(response: NextResponse, value: string) {
	response.cookies.set(SESSION_COOKIE_NAME, value, {
		httpOnly: true,
		secure: true,
		sameSite: "lax",
		maxAge: SESSION_COOKIE_MAX_AGE,
		path: "/",
	});
}

/**
 * Busca a sessão atual na API do Better Auth.
 *
 * Faz uma chamada server-to-server para o endpoint de sessão,
 * encaminhando os cookies do request original (incluindo o
 * better-auth.session_token). Funciona apenas quando o cookie
 * do Better Auth está acessível (ex: localhost, mesmo domínio).
 */
async function fetchSessionFromApi(
	request: NextRequest,
): Promise<{ user: { id: string; role: string } } | null> {
	try {
		const response = await fetch(`${apiBaseUrl}/api/auth/session`, {
			headers: {
				cookie: request.headers.get("cookie") ?? "",
			},
		});
		if (!response.ok) return null;
		const data = await response.json();
		if (!data?.user?.id || !data?.user?.role) return null;
		return data as { user: { id: string; role: string } };
	} catch {
		return null;
	}
}

/**
 * Middleware de autenticação para o dashboard.
 *
 * Estratégia:
 *
 * 1. Valida o cookie assinado do Next.js (mobiliza.session)
 *    → Se válido e não expirado, libera sem consultar a API
 *
 * 2. Se o cookie estiver ausente/expirado, tenta obter a sessão
 *    diretamente da API (funciona quando os domínios compartilham
 *    o cookie do Better Auth, ex: localhost).
 *    → Se conseguir, cria novo cookie assinado e libera
 *
 * 3. Se não conseguir (domínios diferentes em produção),
 *    redireciona para /auth?redirect=<path> para que o front-end
 *    obtenha a sessão via Better Auth (que tem o cookie no domínio
 *    da API) e crie o cookie assinado.
 */
export default async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Rotas que não precisam de autenticação
	if (
		pathname.startsWith("/auth") ||
		pathname.startsWith("/_next") ||
		pathname.startsWith("/api") ||
		pathname.startsWith("/assets") ||
		pathname === "/favicon.ico"
	) {
		return NextResponse.next();
	}

	// ── 1. Tentar validar o cookie assinado ──────────────────────────
	const signedCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

	if (signedCookie) {
		const payload = await verifySessionCookieValue(signedCookie);
		if (payload) {
			if (payload.role !== "manager") {
				return NextResponse.redirect(
					new URL("/auth?error=unauthorized_role", request.url),
				);
			}
			// Cookie válido e papel correto — libera sem chamar a API
			return NextResponse.next();
		}
		// Cookie expirado ou inválido → tenta renovar abaixo
	}

	// ── 2. Tentar renovar via API (funciona em localhost/ mesmo domínio) ──
	const betterAuthCookie = request.cookies.get(BETTER_AUTH_SESSION_COOKIE);

	if (betterAuthCookie) {
		const session = await fetchSessionFromApi(request);
		if (session?.user.role === "manager") {
			const newCookieValue = await createSessionCookieValue(
				session.user.id,
				session.user.role,
			);
			const response = NextResponse.next();
			setSessionCookie(response, newCookieValue);
			return response;
		}
	}

	// ── 3. Redirecionar para /auth (domínios diferentes) ───────────────
	// O front-end em /auth obtém a sessão via Better Auth (que tem o
	// cookie no domínio da API) e cria o cookie assinado.
	const redirectTarget = new URL("/auth", request.url);
	redirectTarget.searchParams.set("redirect", pathname);
	return NextResponse.redirect(redirectTarget);
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth).*)"],
};
