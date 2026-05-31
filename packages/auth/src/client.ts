"use client";

import { backendBaseUrl } from "@mobiliza/env/base-url";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: `${backendBaseUrl}/api/auth`,
});