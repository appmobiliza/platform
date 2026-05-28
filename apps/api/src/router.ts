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

import { favoritesRouter } from "./routers/favorites";
import { locationsRouter } from "./routers/locations";
import { metricsRouter } from "./routers/metrics";
import { notificationsRouter } from "./routers/notifications";
import { profilesRouter } from "./routers/profiles";
import { requestsRouter } from "./routers/requests";
import { router } from "./trpc/context";

export const appRouter = router({
  requests: requestsRouter,
  profiles: profilesRouter,
  locations: locationsRouter,
  notifications: notificationsRouter,
  metrics: metricsRouter,
  favorites: favoritesRouter,
});

export type AppRouter = typeof appRouter;
