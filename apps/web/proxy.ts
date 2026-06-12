import { getSession } from "@mobiliza/auth/server";

import { type NextRequest, NextResponse } from "next/server";

/**
 * Cache em memória para a verificação de sessão no proxy.
 *
 * O Edge Runtime mantém o módulo em memória entre requisições
 * no mesmo worker. Isso evita uma query no banco a cada navegação.
 * O TTL curto (30s) garante que a sessão não fique desatualizada.
 *
 * Em produção, múltiplos workers podem ter caches independentes,
 * mas isso ainda reduz significativamente o número de queries.
 */
const sessionCache = new Map<string, { valid: boolean; expiresAt: number }>();

function getSessionToken(request: NextRequest): string | null {
	const cookieHeader = request.headers.get("cookie");
	if (!cookieHeader) return null;

	// Better Auth usa este padrão de cookie — acessa o token da sessão
	const match = cookieHeader.match(
		/(?:better-auth\.session_token|__session)=([^;]+)/,
	);
	return match?.[1] ?? null;
}

/**
 * Protege as rotas do dashboard verificando se o usuário possui
 * uma sessão válida com papel de gestor. Redireciona para /auth
 * caso contrário.
 */
export default async function middleware(request: NextRequest) {
	const token = getSessionToken(request);

	// Se não tem cookie de sessão, redireciona sem consultar o banco
	if (!token) {
		return NextResponse.redirect(new URL("/auth", request.url));
	}

	// Verifica cache local (TTL de 30s)
	const cached = sessionCache.get(token);
	if (cached && cached.expiresAt > Date.now()) {
		if (!cached.valid) {
			return NextResponse.redirect(
				new URL("/auth?error=unauthorized_role", request.url),
			);
		}
		return NextResponse.next();
	}

	// Cache miss: consulta o banco
	const session = await getSession(request.headers);
	const isValid =
		session?.user?.role === "manager";

	sessionCache.set(token, {
		valid: isValid,
		expiresAt: Date.now() + 30_000,
	});

	if (!isValid) {
		return NextResponse.redirect(
			new URL("/auth?error=unauthorized_role", request.url),
		);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth).*)"],
};
