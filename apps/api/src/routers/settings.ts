/**
 * Router de configurações do sistema.
 *
 * Gerencia configurações gerais (chave-valor) e definições de turnos.
 * Apenas gestores podem modificar; leitura é pública/autenticada.
 */

import {
	DEFAULT_SETTINGS,
	getDefaultShiftTimes,
	UpsertAppSettingSchema,
	UpsertShiftDefinitionsSchema,
} from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { managerProcedure, protectedProcedure, router } from "@mobiliza/trpc";

import { TRPCError } from "@trpc/server";
import { uuidv7 } from "uuidv7";
import { z } from "zod";

export const settingsRouter = router({
	// ─── App Settings ─────────────────────────────────────────────────────

	/**
	 * Retorna todas as configurações do sistema.
	 * Usa valores padrão estáticos como fallback quando não há registro no banco.
	 * Acessível a qualquer usuário autenticado.
	 */
	list: protectedProcedure.query(async () => {
		const rows = await db.query.appSettings.findMany();

		// Mescla com defaults — o que está no banco sobrescreve
		const merged = { ...DEFAULT_SETTINGS } as Record<string, unknown>;

		for (const row of rows) {
			merged[row.key] = row.value;
		}

		return merged;
	}),

	/**
	 * Retorna uma configuração específica pelo nome da chave.
	 */
	getByKey: protectedProcedure
		.input(z.object({ key: z.string() }))
		.query(async ({ input }) => {
			const row = await db.query.appSettings.findFirst({
				where: eq(schema.appSettings.key, input.key),
			});

			if (!row) {
				const defaultValue =
					DEFAULT_SETTINGS[input.key as keyof typeof DEFAULT_SETTINGS];
				if (defaultValue !== undefined) {
					return { key: input.key, value: defaultValue };
				}
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			return { key: row.key, value: row.value };
		}),

	/**
	 * Cria ou atualiza uma configuração.
	 */
	upsert: managerProcedure
		.input(UpsertAppSettingSchema)
		.mutation(async ({ input }) => {
			const [setting] = await db
				.insert(schema.appSettings)
				.values({
					key: input.key,
					value: input.value,
				})
				.onConflictDoUpdate({
					target: schema.appSettings.key,
					set: {
						value: input.value,
						updatedAt: new Date(),
					},
				})
				.returning();

			return setting;
		}),

	/**
	 * Remove uma configuração (volta ao valor padrão).
	 */
	delete: managerProcedure
		.input(z.object({ key: z.string() }))
		.mutation(async ({ input }) => {
			const [deleted] = await db
				.delete(schema.appSettings)
				.where(eq(schema.appSettings.key, input.key))
				.returning();

			if (!deleted) throw new TRPCError({ code: "NOT_FOUND" });
			return deleted;
		}),

	// ─── Shift Definitions ────────────────────────────────────────────────

	/**
	 * Lista todas as definições de turno ativas.
	 * Acessível a qualquer usuário autenticado.
	 */
	listShiftDefinitions: protectedProcedure.query(async () => {
		const definitions = await db.query.shiftDefinition.findMany({
			orderBy: (t, { asc }) => [asc(t.shift), asc(t.dayOfWeek)],
		});

		return definitions;
	}),

	/**
	 * Lista apenas as definições de turno ativas (isEnabled = true).
	 * Útil para determinar o turno vigente.
	 */
	listActiveShiftDefinitions: protectedProcedure.query(async () => {
		const definitions = await db.query.shiftDefinition.findMany({
			where: eq(schema.shiftDefinition.isEnabled, true),
			orderBy: (t, { asc }) => [asc(t.shift), asc(t.dayOfWeek)],
		});

		return definitions;
	}),

	/**
	 * Substitui todas as definições de turno em lote.
	 * Útil para o painel do gestor configurar a semana inteira de uma vez.
	 */
	upsertShiftDefinitions: managerProcedure
		.input(UpsertShiftDefinitionsSchema)
		.mutation(async ({ input }) => {
			// Limpa todas as definições existentes
			await db.delete(schema.shiftDefinition);

			// Insere as novas definições
			if (input.definitions.length > 0) {
				await db.insert(schema.shiftDefinition).values(
					input.definitions.map((def) => ({
						id: uuidv7(),
						shift: def.shift,
						dayOfWeek: def.dayOfWeek,
						startTime: def.startTime,
						endTime: def.endTime,
						isEnabled: def.isEnabled,
					})),
				);
			}

			// Retorna as definições atualizadas
			return db.query.shiftDefinition.findMany({
				orderBy: (t, { asc }) => [asc(t.shift), asc(t.dayOfWeek)],
			});
		}),

	/**
	 * Retorna as definições de turno com fallback para valores padrão.
	 * Útil para o app determinar em qual turno estamos.
	 */
	getShiftSchedule: protectedProcedure.query(async () => {
		const definitions = await db.query.shiftDefinition.findMany({
			where: eq(schema.shiftDefinition.isEnabled, true),
		});

		// Se não há definições configuradas, usa os valores padrão
		if (definitions.length === 0) {
			const defaultTimes = getDefaultShiftTimes();
			const daysOfWeek = [
				"sunday",
				"monday",
				"tuesday",
				"wednesday",
				"thursday",
				"friday",
				"saturday",
			] as const;

			return daysOfWeek.flatMap((day) =>
				Object.entries(defaultTimes).map(([shift, times]) => ({
					shift,
					dayOfWeek: day,
					startTime: times.startTime,
					endTime: times.endTime,
					isEnabled:
						day !== "sunday" && day !== "saturday" ? true : false,
				})),
			);
		}

		return definitions;
	}),
});
