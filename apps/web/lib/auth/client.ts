import { createAuthClient } from "@mobiliza/auth/client";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_WEB_URL,
});
