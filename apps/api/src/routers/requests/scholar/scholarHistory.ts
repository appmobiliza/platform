import { PaginationSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { getScholarHistory } from "@mobiliza/domain";
import { scholarProcedure } from "@mobiliza/trpc";

export const scholarHistory = scholarProcedure
	.input(PaginationSchema)
	.query(async ({ ctx, input }) => {
		const history = await getScholarHistory(
			input,
			ctx.session.user.id,
			db,
		);
		return history;
	});
