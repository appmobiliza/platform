/**
 * Router de perfis — criação de perfil de estudante e bolsista,
 * aprovação de bolsistas pelo gestor, e toggle de disponibilidade.
 */

import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { TRPCError } from "@trpc/server";
import { uuidv7 } from "uuidv7";
import { z } from "zod";

import {
	managerProcedure,
	protectedProcedure,
	router,
	scholarProcedure,
} from "@/trpc/context";

export const profilesRouter = router({
	/**
	 * Retorna o perfil completo do usuário autenticado.
	 * Inclui studentProfile ou scholarProfile conforme o role.
	 */
	me: protectedProcedure
		.meta({ openapi: { method: "GET", path: "/profiles/me" } })
		.output(z.any())
		.query(async ({ ctx }) => {
		const user = await db.query.user.findFirst({
			where: eq(schema.user.id, ctx.session.user.id),
			with: {
				studentProfile: true,
				scholarProfile: true,
			},
		});

		if (!user) throw new TRPCError({ code: "NOT_FOUND" });
		return user;
	}),

	/**
	 * Onboarding: cria perfil de estudante para o usuário autenticado.
	 * Idempotente — retorna o perfil existente se já cadastrado.
	 */
	createStudent: protectedProcedure
		.meta({ openapi: { method: "POST", path: "/profiles/student" } })
		.input(
			z.object({
				enrollment: z.string().min(4).max(20),
				course: z.enum(schema.courseValues),
				campus: z.enum(schema.campusValues),
				phone: z.string().regex(/^\d{10,11}$/),
				shift: z.enum(schema.studentShiftValues),
				gender: z.enum(schema.genderValues),
				nickname: z.string().max(30).optional(),
				disabilityTypes: z
					.array(z.enum(schema.disabilityTypeValues))
					.min(1),
				attendanceNotes: z.string().max(1000).optional(),
				simplifiedInterface: z.boolean().default(false),
			}),
		)
		.output(z.any())
		.mutation(async ({ ctx, input }) => {
			const existing = await db.query.studentProfile.findFirst({
				where: eq(schema.studentProfile.userId, ctx.session.user.id),
			});

			if (existing) return existing;

			// Garante que o role do usuário está correto
			await db
				.update(schema.user)
				.set({ role: "student", updatedAt: new Date() })
				.where(eq(schema.user.id, ctx.session.user.id));

			const { disabilityTypes, ...profileData } = input;

			const [profile] = await db
				.insert(schema.studentProfile)
				.values({
					id: uuidv7(),
					userId: ctx.session.user.id,
					...profileData,
				})
				.returning();

			await db.insert(schema.studentDisability).values(
				disabilityTypes.map((dt) => ({
					id: uuidv7(),
					studentProfileId: profile.id,
					disabilityType: dt,
				})),
			);

			return profile;
		}),

	/**
	 * Onboarding: cria perfil de bolsista para o usuário autenticado.
	 * O bolsista começa como `isApproved: false` — aguarda aprovação do gestor.
	 */
	createScholar: protectedProcedure
		.meta({ openapi: { method: "POST", path: "/profiles/scholar" } })
		.input(
			z.object({
				enrollment: z.string().min(4).max(20),
				course: z.enum(schema.courseValues),
				campus: z.enum(schema.campusValues),
				shift: z.enum(schema.scholarShiftValues),
				phone: z.string().regex(/^\d{10,11}$/),
				cpf: z.string().regex(/^\d{11}$/),
			}),
		)
		.output(z.any())
		.mutation(async ({ ctx, input }) => {
			const existing = await db.query.scholarProfile.findFirst({
				where: eq(schema.scholarProfile.userId, ctx.session.user.id),
			});

			if (existing) return existing;

			await db
				.update(schema.user)
				.set({ role: "scholar", updatedAt: new Date() })
				.where(eq(schema.user.id, ctx.session.user.id));

			const [profile] = await db
				.insert(schema.scholarProfile)
				.values({
					id: uuidv7(),
					userId: ctx.session.user.id,
					...input,
					isApproved: false,
					isAvailable: false,
				})
				.returning();

			return profile;
		}),

	/**
	 * Bolsista alterna sua disponibilidade.
	 * Apenas bolsistas aprovados podem ficar disponíveis.
	 */
	toggleAvailability: scholarProcedure
		.meta({ openapi: { method: "POST", path: "/profiles/availability" } })
		.output(z.any())
		.mutation(async ({ ctx }) => {
		const profile = await db.query.scholarProfile.findFirst({
			where: eq(schema.scholarProfile.userId, ctx.session.user.id),
		});

		if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

		if (!profile.isApproved) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message:
					"Seu cadastro ainda não foi aprovado pelo NAC. Aguarde a aprovação para ativar a disponibilidade.",
			});
		}

		const [updated] = await db
			.update(schema.scholarProfile)
			.set({
				isAvailable: !profile.isAvailable,
				updatedAt: new Date(),
			})
			.where(eq(schema.scholarProfile.id, profile.id))
			.returning();

		return updated;
	}),

	// ─── Rotas do gestor ──────────────────────────────────────────────────────

	/**
	 * Lista todos os bolsistas pendentes de aprovação.
	 */
	pendingScholars: managerProcedure
		.meta({ openapi: { method: "GET", path: "/profiles/pending-scholars" } })
		.output(z.any())
		.query(async () => {
		return db.query.scholarProfile.findMany({
			where: eq(schema.scholarProfile.isApproved, false),
			with: { user: true },
			orderBy: (t, { asc }) => [asc(t.createdAt)],
		});
	}),

	/**
	 * Aprova ou rejeita um bolsista.
	 * Rejeitar = desativar o perfil (isActive: false).
	 */
	reviewScholar: managerProcedure
		.meta({ openapi: { method: "POST", path: "/profiles/review-scholar" } })
		.input(
			z.object({
				scholarProfileId: z.string(),
				approved: z.boolean(),
			}),
		)
		.output(z.any())
		.mutation(async ({ ctx, input }) => {
			const profile = await db.query.scholarProfile.findFirst({
				where: eq(schema.scholarProfile.id, input.scholarProfileId),
				with: { user: true },
			});

			if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

			const now = new Date();

			const [updated] = await db
				.update(schema.scholarProfile)
				.set({
					isApproved: input.approved,
					isActive: input.approved,
					approvedAt: input.approved ? now : null,
					approvedBy: input.approved ? ctx.session.user.id : null,
					updatedAt: now,
				})
				.where(eq(schema.scholarProfile.id, input.scholarProfileId))
				.returning();

			// Notificação via realtime para o bolsista
			await ctx.realtime.publish(
				`user:${profile.userId}`,
				input.approved ? "scholar:approved" : "scholar:rejected",
				{ scholarProfileId: input.scholarProfileId },
			);

			return updated;
		}),
});
