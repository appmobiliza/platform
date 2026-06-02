import { PaginationSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { AppError, getScholarHistory } from "@mobiliza/domain";

import { TRPCError } from "@trpc/server";

import { scholarProcedure } from "@/trpc/context";
import { toTRPCCode } from "@/utils/error";

export const scholarHistory = scholarProcedure
	.input(PaginationSchema)
	.query(async ({ ctx, input }) => {
		try {
			const history = await getScholarHistory(
				input,
				ctx.session.user.id,
				db,
			);
			return history;
		} catch (error) {
			if (error instanceof AppError) {
				throw new TRPCError({
					code: toTRPCCode(error),
					message: error.message,
				});
			}
			throw error;
		}
	});
