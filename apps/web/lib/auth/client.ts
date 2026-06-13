"use client";

import { createAuthClient } from "@mobiliza/auth/client";
import { webBaseUrl } from "@mobiliza/env/base-url";

console.log("webBaseUrl", webBaseUrl);

export const authClient = createAuthClient({
	baseURL: `${webBaseUrl}/api/auth`,
});
