import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { protectedProcedure } from "@mobiliza/trpc";;

export const getExtraShiftRequests = protectedProcedure
	.query(async ({ ctx }) => {
		const isScholar = ctx.session.user.role === "scholar";

		// Bolsistas veem apenas as próprias solicitações
		if (isScholar) {
			const profile = await db.query.scholarProfile.findFirst({
				where: eq(schema.scholarProfile.userId, ctx.session.user.id),
			});

			if (!profile) return [];

			const requests = await db.query.extraShiftRequest.findMany({
				where: eq(
					schema.extraShiftRequest.scholarProfileId,
					profile.id,
				),
				with: {
					approvedBy: true,
				},
				orderBy: (table, { desc }) => [desc(table.createdAt)],
			});

			return requests.map((req) => ({
				...req,
			}));
		}

		// Gestores veem todas as solicitações com informações dos bolsistas
		const requests = await db.query.extraShiftRequest.findMany({
			with: {
				scholarProfile: {
					with: {
						user: true,
					},
				},
				approvedBy: true,
			},
			orderBy: (table, { desc }) => [desc(table.createdAt)],
		});

		return requests.map((req) => ({
			id: req.id,
			scholarProfileId: req.scholarProfileId,
			date: req.date,
			shift: req.shift,
			reason: req.reason,
			customReason: req.customReason,
			status: req.status,
			approvedById: req.approvedById,
			approvedAt: req.approvedAt,
			createdAt: req.createdAt,
			updatedAt: req.updatedAt,
			scholar: {
				id: req.scholarProfile.id,
				name: req.scholarProfile.user.name,
				email: req.scholarProfile.user.email,
				enrollment: req.scholarProfile.enrollment,
				course: req.scholarProfile.course,
			},
			approvedBy: req.approvedBy
				? {
					id: req.approvedBy.id,
					name: req.approvedBy.name,
				}
				: null,
		}));
	});
