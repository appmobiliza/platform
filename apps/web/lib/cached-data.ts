import "server-only";

import type { AppRouter } from "@mobiliza/api/router";

import { cacheLife, cacheTag } from "next/cache";

import { getTodayRange } from "./dashboard-data";
import { withServerTRPC } from "./trpc-server";

// ─── Tipos herdados do tRPC ─────────────────────────────────────────────────────

type TRPCCaller = ReturnType<AppRouter["createCaller"]>;

/** Tipo do retorno de `metrics.summary` */
type SummaryOutput = Awaited<ReturnType<TRPCCaller["metrics"]["summary"]>>;

/** Tipo do retorno de `profiles.scholarDashboard` */
type ScholarDashboardOutput = Awaited<
	ReturnType<TRPCCaller["profiles"]["scholarDashboard"]>
>;

export type CachedScholar = ScholarDashboardOutput["scholars"][number];

/** Tipo do retorno de `profiles.studentDashboard` */
type StudentDashboardOutput = Awaited<
	ReturnType<TRPCCaller["profiles"]["studentDashboard"]>
>;

/** Tipo do retorno de `requests.managerList` — item individual */
type ManagerListOutput = Awaited<
	ReturnType<TRPCCaller["requests"]["managerList"]>
>;
export type CachedManagerRequest = ManagerListOutput[number];

/** Tipo do retorno de `metrics.scholarPerformance` */
type ScholarPerformanceOutput = Awaited<
	ReturnType<TRPCCaller["metrics"]["scholarPerformance"]>
>;

// ─── Funções cacheadas ──────────────────────────────────────────────────────────

/**
 * Métricas agregadas do período (cards do topo).
 * Cache: 30s stale + 60s revalidate = no máximo 1 requisição ao DB por minuto.
 */
export async function getCachedSummary(
	from?: string,
	to?: string,
): Promise<SummaryOutput> {
	"use cache: remote";

	// Se não receber um range explícito, usa o dia atual
	const { from: f, to: t } =
		from && to ? { from, to } : getTodayRange();

	cacheLife({ stale: 30, revalidate: 60, expire: 300 });
	cacheTag("metrics-summary");

	return withServerTRPC((trpc) =>
		trpc.metrics.summary({ from: f, to: t }),
	);
}

/**
 * Painel de bolsistas (status, turno, etc.).
 * Cache: 15s stale + 30s revalidate.
 */
export async function getCachedScholarDashboard(): Promise<ScholarDashboardOutput> {
	"use cache: remote";
	cacheLife({ stale: 15, revalidate: 30, expire: 120 });
	cacheTag("scholar-dashboard");

	return withServerTRPC((trpc) => trpc.profiles.scholarDashboard());
}

/**
 * Painel de estudantes (cadastros, deficiências, resumo).
 * Cache: 30s stale + 60s revalidate.
 */
export async function getCachedStudentDashboard(): Promise<StudentDashboardOutput> {
	"use cache: remote";
	cacheLife({ stale: 30, revalidate: 60, expire: 300 });
	cacheTag("student-dashboard");

	return withServerTRPC((trpc) => trpc.profiles.studentDashboard());
}

/**
 * Lista de solicitações do manager.
 * Cache: 15s stale + 30s revalidate.
 */
export async function getCachedManagerList(
	limit: number,
): Promise<ManagerListOutput> {
	"use cache";
	cacheLife({ stale: 15, revalidate: 30, expire: 120 });
	cacheTag("manager-requests");

	return withServerTRPC((trpc) => trpc.requests.managerList({ limit }));
}

/**
 * Performance dos bolsistas no período (ranking).
 * Cache: 60s stale + 120s revalidate.
 */
export async function getCachedScholarPerformance(
	from: string,
	to: string,
): Promise<ScholarPerformanceOutput> {
	"use cache: remote";
	cacheLife({ stale: 60, revalidate: 120, expire: 600 });
	cacheTag("scholar-performance");

	return withServerTRPC((trpc) =>
		trpc.metrics.scholarPerformance({ from, to }),
	);
}
