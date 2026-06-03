import { db } from "@mobiliza/db/client";
import { AppError, createRequest } from "@mobiliza/domain";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "../../trpc/context";
import { createRequestInput } from "./shared";

export const create = protectedProcedure
	.meta({ openapi: { method: "POST", path: "/requests/create" } })
	.input(createRequestInput)
	.output(z.any())
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
					"requests:available",
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
