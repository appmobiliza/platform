"use client";

import { createAuthClient } from "better-auth/react";

import { getBackendBaseUrl } from "@/lib/api";

export const authClient = createAuthClient({
	baseURL: `${getBackendBaseUrl()}/api/auth`,
});