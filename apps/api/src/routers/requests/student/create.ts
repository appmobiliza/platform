import { CreateRequestSchema, ServiceRequestSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { AppError, createRequest } from "@mobiliza/domain";
import { protectedProcedure } from "@mobiliza/trpc";

import { TRPCError } from "@trpc/server";

export const create = protectedProcedure
	.input(CreateRequestSchema)
	.mutation(async ({ ctx, input }) => {
		try {
			const request = await createRequest(input, ctx.session.user.id, db);

			if (!request) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Não foi possível criar a solicitação.",
				});
			}

			// Notifica bolsistas disponíveis via realtime
			try {
				await ctx.realtime.publish(
					"requests:pending",
					"request:new",
					{
						requestId: request.id,
						studentId: ctx.session.user.id,
						originLocationId: input.originLocationId,
						destinationLocationId: input.destinationLocationId,
					},
				);
			} catch (publishError) {
				console.error(
					"[Realtime] Failed to publish request:new event:",
					publishError,
				);
			}

			return request;
		} catch (error) {
			if (error instanceof AppError) {
				const trpcCode =
					error.code === "VALIDATION_ERROR"
						? "BAD_REQUEST"
						: error.code;

				throw new TRPCError({
					code: trpcCode as TRPCError["code"],
					message: error.message,
				});
			}
			throw error;
		}
	});
