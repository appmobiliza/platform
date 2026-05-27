import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import Ably from "ably";

async function checkInfra() {
  console.log("🔍 Iniciando Health Check de Infraestrutura...\n");

  // 1. Banco de Dados (Neon)
  console.log("🐘 [DATABASE] Validando conexão com Neon...");
  if (!process.env.DATABASE_URL) {
    console.error("❌ Erro: DATABASE_URL não definida no .env");
  } else {
    try {
      const sql = neon(process.env.DATABASE_URL);
      const db = drizzle(sql);
      const start = Date.now();
      await sql`SELECT 1`;
      const end = Date.now();
      console.log(`✅ DATABASE: Conectado com sucesso! (Latência: ${end - start}ms)`);
    } catch (error) {
      console.error("❌ DATABASE: Falha na conexão!");
      console.error(error);
    }
  }

  console.log("");

  // 2. Realtime (Ably)
  console.log("📡 [REALTIME] Validando conexão com Ably...");
  if (!process.env.ABLY_API_KEY) {
    console.warn("⚠️  Aviso: ABLY_API_KEY não definida. Pulando teste do Ably.");
  } else {
    try {
      const ably = new Ably.Realtime(process.env.ABLY_API_KEY);
      
      const connectionResult = await Promise.race([
        new Promise((resolve) => {
          ably.connection.on("connected", () => resolve("connected"));
          ably.connection.on("failed", (err) => resolve(`failed: ${err.reason?.message}`));
        }),
        new Promise((_, reject) => setTimeout(() => reject("timeout"), 5000))
      ]);

      if (connectionResult === "connected") {
        console.log("✅ REALTIME: Ably conectado com sucesso!");
        
        // Tenta um publish simples
        const channel = ably.channels.get("health-check");
        await channel.publish("ping", { timestamp: Date.now() });
        console.log("✅ REALTIME: Mensagem de teste enviada com sucesso!");
      } else {
        console.error(`❌ REALTIME: Falha na conexão (${connectionResult})`);
      }
      
      ably.close();
    } catch (error) {
      console.error("❌ REALTIME: Erro inesperado ao testar Ably");
      console.error(error);
    }
  }

  console.log("\n✨ Health Check finalizado.");
  process.exit(0);
}

checkInfra();
