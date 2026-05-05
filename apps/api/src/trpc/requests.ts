import { createRequestInputSchema } from "@mobiliza/contracts";
import { createRequest, listRequests } from "@mobiliza/domain";
import { publicProcedure, router } from "./trpc.js";

export const requestRouter = router({
  list: publicProcedure.query(async ({ ctx }) => listRequests(ctx.requests)),
  create: publicProcedure.input(createRequestInputSchema).mutation(async ({ ctx, input }) => {
    const request = await createRequest(input, ctx.requests);

    await ctx.realtime.publish(`request:${request.id}`, "request.created", {
      requestId: request.id,
      status: request.status,
    });

    return request;
  }),
});
