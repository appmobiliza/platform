import { db } from "@mobiliza/db/client";
import * as schema from "@mobiliza/db/schema";
import { apiEnv } from "@mobiliza/env/api";
import { realtimeEnv } from "@mobiliza/env/realtime";
import { createRealtimeAdapter } from "@mobiliza/realtime";

async function checkInfra() {
	console.log("🔍 Iniciando Health Check de Infraestrutura...\n");

	// 1. Banco de Dados (Neon)
	console.log("🐘 [DATABASE] Validando conexão com Neon...");
	if (!apiEnv.DATABASE_URL) {
		console.error("❌ Erro: DATABASE_URL não definida no .env");
	} else {
		try {
			const start = Date.now();
			await db.select().from(schema.account).limit(1); // Consulta simples para testar a conexão
			const end = Date.now();
			console.log(
				`✅ DATABASE: Conectado com sucesso! (Latência: ${end - start}ms)`,
			);
		} catch (error) {
			console.error("❌ DATABASE: Falha na conexão!");
			console.error(error);
		}
	}

	console.log(`📡 Realtime provider atual: ${realtimeEnv.REALTIME_PROVIDER}`);

	console.log("");

	// 2. Realtime (Ably)
	try {
		const realtimeAdapter = await createRealtimeAdapter();
		await realtimeAdapter
			.publish("health-check", "ping", { timestamp: Date.now() })
			.then(() => {
				console.log(
					"✅ REALTIME: Adapter criado e mensagem de teste publicada com sucesso!",
				);
			})
			.catch((error) => {
				console.error(
					"❌ REALTIME: Erro ao publicar mensagem de teste. Verifique a configuração do adapter.",
				);
				console.error(error);
			});
	} catch (error) {
		console.error(
			"❌ REALTIME: Falha ao criar adapter de Realtime. Verifique as variáveis de ambiente.",
		);
		console.error(error);
	}

	console.log("\n✨ Health Check finalizado.");
	process.exit(0);
}

checkInfra();
