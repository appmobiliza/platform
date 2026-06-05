/**
 * Root router do tRPC.
 *
 * Agrega todos os sub-routers e exporta:
 * - `appRouter`  → runtime, usado pelo servidor Hono e pelo servidor Next.js
 *   via `createCaller()` (chamadas in-process, sem HTTP).
 * - `AppRouter`  → tipo, importado por clientes (React Native, tRPC Client)
 *   para tipagem completa sem executar código de servidor.
 *
 * O servidor Next.js importa o runtime `appRouter` em dois contextos:
 * - `trpc-server.ts`  → caller autenticado com a sessão real do request
 * - `cached-data.ts`  → caller sintético para funções `"use cache"`
 *
 * Ambos usam `import "server-only"` para garantir que o código da API
 * nunca vaze para o bundle do cliente.
 *
 * @example Uso no cliente (apenas tipos):
 * ```ts
 * import type { AppRouter } from '@mobiliza/api'
 * const trpc = createTRPCClient<AppRouter>({ ... })
 * ```
 */

import { router } from "@mobiliza/trpc";

import { favoritesRouter } from "./routers/favorites.js";
import { locationsRouter } from "./routers/locations.js";
import { metricsRouter } from "./routers/metrics.js";
import { notificationsRouter } from "./routers/notifications.js";
import { profilesRouter } from "./routers/profiles/index.js";
import { requestsRouter } from "./routers/requests/index.js";

export const appRouter = router({
	requests: requestsRouter,
	profiles: profilesRouter,
	locations: locationsRouter,
	notifications: notificationsRouter,
	metrics: metricsRouter,
	favorites: favoritesRouter,
});

export type AppRouter = typeof appRouter;
