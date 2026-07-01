import { config } from "dotenv";

export function loadEnv(path: string = "../../.env") {
	if (process.env.NODE_ENV === "production") return;
	config({ path });
}
