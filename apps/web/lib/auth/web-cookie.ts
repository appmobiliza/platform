import "server-only";

/**
 * Cookie assinado do Next.js para autenticação no dashboard.
 *
 * Contém apenas userId, role e expiração curta (15 min).
 * A assinatura usa HMAC-SHA256 com a mesma secret do Better Auth.
 *
 * O middleware valida este cookie sem consultar a API ou o banco.
 * Quando expirado, o middleware redireciona para /auth, onde o
 * front-end faz uma chamada autenticada à API (que tem o cookie
 * do Better Auth no domínio da API) para renová-lo.
 */

const COOKIE_NAME = "mobiliza.session";
const COOKIE_MAX_AGE = 15 * 60; // 15 minutos em segundos

const encoder = new TextEncoder();

export interface WebSessionPayload {
	userId: string;
	role: string;
	/** Unix timestamp (segundos) de expiração */
	exp: number;
}

// ─── Helpers Base64URL ────────────────────────────────────────────────────────

function b64url(data: string): string {
	return btoa(data)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

function b64urlDecode(str: string): string {
	str = str.replace(/-/g, "+").replace(/_/g, "/");
	while (str.length % 4) str += "=";
	return atob(str);
}

// ─── HMAC Key (cacheada) ──────────────────────────────────────────────────────

let cachedKey: CryptoKey | null = null;

async function getKey(): Promise<CryptoKey> {
	if (cachedKey) return cachedKey;
	const secret = process.env.BETTER_AUTH_SECRET;
	if (!secret)
		throw new Error(
			"BETTER_AUTH_SECRET é necessária para o cookie de sessão web",
		);
	cachedKey = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret!),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign", "verify"],
	);
	return cachedKey;
}

// ─── Assinatura / Verificação ─────────────────────────────────────────────────

async function sign(data: string): Promise<string> {
	const key = await getKey();
	const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
	return b64url(String.fromCharCode(...new Uint8Array(sig)));
}

async function verify(data: string, signature: string): Promise<boolean> {
	const key = await getKey();
	try {
		const sigBytes = Uint8Array.from(
			atob(signature.replace(/-/g, "+").replace(/_/g, "/")),
			(c) => c.charCodeAt(0),
		);
		return await crypto.subtle.verify(
			"HMAC",
			key,
			sigBytes,
			encoder.encode(data),
		);
	} catch {
		return false;
	}
}

// ─── API Pública ──────────────────────────────────────────────────────────────

/**
 * Cria o valor do cookie de sessão assinado.
 */
export async function createSessionCookieValue(
	userId: string,
	role: string,
): Promise<string> {
	const payload: WebSessionPayload = {
		userId,
		role,
		exp: Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE,
	};
	const encoded = b64url(JSON.stringify(payload));
	const sig = await sign(encoded);
	return `${encoded}.${sig}`;
}

/**
 * Verifica e decodifica o cookie de sessão assinado.
 * Retorna null se o cookie for inválido ou estiver expirado.
 */
export async function verifySessionCookieValue(
	cookieValue: string,
): Promise<WebSessionPayload | null> {
	const parts = cookieValue.split(".");
	if (parts.length !== 2) return null;

	const encoded = parts[0]!;
	const sig = parts[1]!;
	const valid = await verify(encoded, sig);
	if (!valid) return null;

	try {
		const payload: WebSessionPayload = JSON.parse(b64urlDecode(encoded));
		if (!payload.userId || !payload.role || !payload.exp) return null;
		if (payload.exp < Math.floor(Date.now() / 1000)) return null;
		return payload;
	} catch {
		return null;
	}
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const SESSION_COOKIE_MAX_AGE = COOKIE_MAX_AGE;
