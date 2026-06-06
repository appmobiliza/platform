"use client";

import { createAuthClient } from "@mobiliza/auth/client";
import { backendBaseUrl } from "@mobiliza/env/base-url";

export const authClient = createAuthClient({
	baseURL: `${backendBaseUrl}/api/auth`,
});
