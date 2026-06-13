import { apiBaseUrl } from "@mobiliza/env/base-url";

import { type NextRequest, NextResponse } from "next/server";

async function proxy(req: NextRequest): Promise<NextResponse> {
	const url = new URL(req.url);
	const target = `${apiBaseUrl}${url.pathname}${url.search}`;

	const headers = new Headers(req.headers);
	headers.set("x-forwarded-host", url.host);
	headers.set("x-forwarded-proto", url.protocol.replace(":", ""));

	const res = await fetch(target, {
		method: req.method,
		headers,
		body:
			req.method !== "GET" && req.method !== "HEAD"
				? await req.arrayBuffer()
				: undefined,
		redirect: "manual",
	});

	return new NextResponse(res.body, {
		status: res.status,
		statusText: res.statusText,
		headers: res.headers,
	});
}

export const GET = proxy;
export const POST = proxy;
