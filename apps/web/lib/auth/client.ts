"use client";

import { createAuthClient } from "@mobiliza/auth/client";
import { apiBaseUrl } from "@mobiliza/env/base-url";

export const authClient = createAuthClient({
	baseURL: `${apiBaseUrl}/api/auth`,
});
