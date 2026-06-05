import { realtimeEnv } from "@mobiliza/env/realtime";

import Ably from "ably";

async function checkInfra() {
	console.log("📡 [REALTIME] Validando conexão com Ably...");
	if (!realtimeEnv.ABLY_API_KEY) {
		console.warn(
			"⚠️  Aviso: ABLY_API_KEY não definida. Pulando teste do Ably.",
		);
	} else {
		try {
			const ably = new Ably.Realtime(realtimeEnv.ABLY_API_KEY);

			const connectionResult = await Promise.race([
				new Promise((resolve) => {
					ably.connection.on("connected", () => resolve("connected"));
					ably.connection.on("failed", (err) =>
						resolve(`failed: ${err.reason?.message}`),
					);
				}),
				new Promise((_, reject) =>
					setTimeout(() => reject("timeout"), 5000),
				),
			]);

			if (connectionResult === "connected") {
				console.log("✅ REALTIME: Ably conectado com sucesso!");

				// Tenta um publish simples
				const channel = ably.channels.get("health-check");
				await channel.publish("ping", { timestamp: Date.now() });
				console.log(
					"✅ REALTIME: Mensagem de teste enviada com sucesso!",
				);
			} else {
				console.error(
					`❌ REALTIME: Falha na conexão (${connectionResult})`,
				);
			}

			ably.close();
		} catch (error) {
			console.error("❌ REALTIME: Erro inesperado ao testar Ably");
			console.error(error);
		}
	}
}

checkInfra();
