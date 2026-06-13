"use client";

import { createAuthClient } from "@mobiliza/auth/client";
import { apiBaseUrl } from "@mobiliza/env/base-url";

console.log("apiBaseUrl", apiBaseUrl);

export const authClient = createAuthClient({
	baseURL: `${apiBaseUrl}/api/auth`,
});
