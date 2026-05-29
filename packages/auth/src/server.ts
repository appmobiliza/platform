import "server-only";

import { auth } from "./index";

export async function getSession(headers: Headers) {
	return auth.api.getSession({ headers }).catch(() => null);
}