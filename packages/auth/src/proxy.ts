const defaultCookiePrefix = "better-auth";
const defaultSessionCookieName = "session_token";

function hasCookie(headerValue: string, cookieName: string) {
	return headerValue
		.split(";")
		.some((cookie) => cookie.trim().startsWith(`${cookieName}=`));
}

export function hasSessionCookie(
	headers: Headers,
	options?: {
		cookiePrefix?: string;
		cookieName?: string;
	},
) {
	const cookieHeader = headers.get("cookie") ?? "";
	const cookiePrefix = options?.cookiePrefix ?? defaultCookiePrefix;
	const cookieName = options?.cookieName ?? defaultSessionCookieName;

	return hasCookie(cookieHeader, `${cookiePrefix}.${cookieName}`);
}
