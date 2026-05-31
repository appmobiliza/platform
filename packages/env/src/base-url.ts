export const backendBaseUrl =
	process.env.NEXT_PUBLIC_BACKEND_API_URL ??
	process.env.BACKEND_API_URL ??
	"http://localhost:3001";

export const webBaseUrl =
	process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";