import { type NextRequest, NextResponse } from "next/server";

import { hasSessionCookie } from "@mobiliza/auth/proxy";

export function proxy(request: NextRequest) {
	if (!hasSessionCookie(request.headers)) {
		return NextResponse.redirect(new URL("/auth", request.url));
	}

	console.log("Session cookie found, allowing access to the app");

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth).*)"],
};
