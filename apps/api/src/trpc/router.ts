import { requestRouter } from "./requests.js";
import { router } from "./trpc.js";

export const appRouter = router({
  requests: requestRouter,
});

export type AppRouter = typeof appRouter;
