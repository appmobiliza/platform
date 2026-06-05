/**
 * Root router do tRPC.
 *
 * Agrega todos os sub-routers e exporta `AppRouter` — o tipo que o
 * cliente (React Native, Next.js) importa para ter tipagem completa
 * sem importar nenhum código de servidor.
 *
 * @example Uso no cliente:
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
