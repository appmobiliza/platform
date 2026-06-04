/**
 * Router de métricas operacionais para o painel do gestor (NAC).
 *
 * As queries aqui são mais pesadas e devem ser cacheadas na camada
 * de apresentação — use SWR com revalidação periódica, não realtime.
 */

import { ExportReportSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { and, avg, count, desc, eq, gte, lte, sql } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { AppError, generateAttendanceReportCSV } from "@mobiliza/domain";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { managerProcedure, router } from "@mobiliza/trpc";

const dateRangeInput = z.object({
	from: z.iso.datetime(),
	to: z.iso.datetime(),
});

export const metricsRouter = router({
	/**
	 * Resumo geral do período — cards no topo do dashboard.
	 */
	summary: managerProcedure
		.meta({ openapi: { method: "GET", path: "/metrics/summary" } })
		.input(dateRangeInput)
		.output(z.any())
		.query(async ({ input, ctx }) => {
			console.log(
				ctx.session.session.id,
				"requested metrics summary with input:",
				input,
			);

			const from = new Date(input.from);
			const to = new Date(input.to);

			const inPeriod = and(
				gte(schema.serviceRequest.createdAt, from),
				lte(schema.serviceRequest.createdAt, to),
			);

			const [totals] = await db
				.select({
					total: count(),
					completed: sql<number>`COUNT(*) FILTER (WHERE status = 'completed')`,
					cancelled: sql<number>`COUNT(*) FILTER (WHERE status = 'cancelled')`,
					unattended: sql<number>`COUNT(*) FILTER (WHERE status = 'unattended')`,
				})
				.from(schema.serviceRequest)
				.where(inPeriod);

			const [attendanceStats] = await db
				.select({
					avgDurationSeconds: avg(
						schema.serviceAttendance.durationSeconds,
					),
					avgRating: avg(schema.serviceAttendance.rating),
					totalRated: sql<number>`COUNT(*) FILTER (WHERE rating IS NOT NULL)`,
				})
				.from(schema.serviceAttendance)
				.innerJoin(
					schema.serviceRequest,
					eq(
						schema.serviceAttendance.requestId,
						schema.serviceRequest.id,
					),
				)
				.where(inPeriod);

			return {
				totalRequests: Number(totals?.total ?? 0),
				completedRequests: Number(totals?.completed ?? 0),
				cancelledRequests: Number(totals?.cancelled ?? 0),
				unattendedRequests: Number(totals?.unattended ?? 0),
				completionRate: totals?.total
					? Number(totals.completed) / Number(totals.total)
					: 0,
				avgDurationSeconds: attendanceStats?.avgDurationSeconds
					? Math.round(Number(attendanceStats.avgDurationSeconds))
					: null,
				avgRating: attendanceStats?.avgRating
					? Number(Number(attendanceStats.avgRating).toFixed(1))
					: null,
			};
		}),

	/**
	 * Exportação de relatório completo em CSV para análise offline.
	 * Gera um arquivo com detalhes de cada solicitação e atendimento.
	 */
	exportCSV: managerProcedure
		.input(ExportReportSchema)
		.query(async ({ input }) => {
			const csv = await generateAttendanceReportCSV(input, db);
			return csv;
		}),

	/**
	 * Distribuição de solicitações por local de origem.
	 * Identifica pontos do campus com maior demanda.
	 */
	byOriginLocation: managerProcedure
		.meta({
			openapi: { method: "GET", path: "/metrics/by-origin-location" },
		})
		.input(dateRangeInput)
		.output(z.any())
		.query(async ({ input }) => {
			const from = new Date(input.from);
			const to = new Date(input.to);

			return db
				.select({
					locationId: schema.campusLocation.id,
					locationName: schema.campusLocation.name,
					locationAbbreviation: schema.campusLocation.abbreviation,
					requestCount: count(),
				})
				.from(schema.serviceRequest)
				.innerJoin(
					schema.campusLocation,
					eq(
						schema.serviceRequest.originLocationId,
						schema.campusLocation.id,
					),
				)
				.where(
					and(
						gte(schema.serviceRequest.createdAt, from),
						lte(schema.serviceRequest.createdAt, to),
					),
				)
				.groupBy(
					schema.campusLocation.id,
					schema.campusLocation.name,
					schema.campusLocation.abbreviation,
				)
				.orderBy(desc(count()));
		}),

	/**
	 * Performance dos bolsistas no período.
	 * Mostra atendimentos, avaliação média e duração média por bolsista.
	 */
	scholarPerformance: managerProcedure
		.meta({
			openapi: { method: "GET", path: "/metrics/scholar-performance" },
		})
		.input(dateRangeInput)
		.output(z.any())
		.query(async ({ input }) => {
			const from = new Date(input.from);
			const to = new Date(input.to);

			return db
				.select({
					scholarProfileId: schema.scholarProfile.id,
					scholarName: schema.user.name,
					scholarEmail: schema.user.email,
					totalAttendances: count(),
					avgRating: avg(schema.serviceAttendance.rating),
					avgDurationSeconds: avg(
						schema.serviceAttendance.durationSeconds,
					),
				})
				.from(schema.serviceAttendance)
				.innerJoin(
					schema.scholarProfile,
					eq(
						schema.serviceAttendance.scholarProfileId,
						schema.scholarProfile.id,
					),
				)
				.innerJoin(
					schema.user,
					eq(schema.scholarProfile.userId, schema.user.id),
				)
				.innerJoin(
					schema.serviceRequest,
					eq(
						schema.serviceAttendance.requestId,
						schema.serviceRequest.id,
					),
				)
				.where(
					and(
						gte(schema.serviceRequest.createdAt, from),
						lte(schema.serviceRequest.createdAt, to),
						eq(schema.serviceRequest.status, "completed"),
					),
				)
				.groupBy(
					schema.scholarProfile.id,
					schema.user.name,
					schema.user.email,
				)
				.orderBy(desc(count()));
		}),
});
