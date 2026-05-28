import { db } from "@mobiliza/db/client";
import { AppError, createRequest } from "@mobiliza/domain";
import { TRPCError } from "@trpc/server";

import { protectedProcedure } from "../../trpc/context";
import { createRequestInput } from "./shared";

export const create = protectedProcedure
	.input(createRequestInput)
	.mutation(async ({ ctx, input }) => {
		try {
			const request = await createRequest(input, ctx.session.user.id, db);

			// Notifica bolsistas disponíveis via realtime
			await ctx.realtime.publish("requests:available", "request:new", {
				requestId: request.id,
				studentId: ctx.session.user.id,
				originLocationId: input.originLocationId,
				destinationLocationId: input.destinationLocationId,
			});

			return request;
		} catch (error) {
			if (error instanceof AppError) {
				throw new TRPCError({
					code: error.code as any,
					message: error.message,
				});
			}
			throw error;
		}
	});
