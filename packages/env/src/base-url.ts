export const apiBaseUrl =
	process.env.API_URL ??
	process.env.NEXT_PUBLIC_API_URL ??
	"http://localhost:3001";

export const webBaseUrl =
	process.env.WEB_URL ??
	process.env.NEXT_PUBLIC_WEB_URL ??
	"http://localhost:3000";
