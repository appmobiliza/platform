import { z } from "zod";

import { dayOfWeekValues, scholarShiftValues } from "./enums";

// ─── App Settings ────────────────────────────────────────────────────────────

/**
 * Chaves de configuração do sistema.
 * Cada chave tem um tipo esperado para o valor JSONB.
 */
export const APP_SETTINGS_KEYS = [
	"maxServiceRequestTime",
	"institution_name",
	"contact_email",
	"contact_phone",
	"restrict_domains",
	"allowed_domains",
	"suspend_services",
] as const;

export type AppSettingsKey = (typeof APP_SETTINGS_KEYS)[number];

/**
 * Valores padrão estáticos para as configurações do sistema.
 * Usados quando não há registro no banco ou como fallback.
 */
export const DEFAULT_SETTINGS: Record<AppSettingsKey, unknown> = {
	maxServiceRequestTime: 10, // 10 minutos
	institution_name: "Universidade Federal de Alagoas (UFAL)",
	contact_email: "nac@ufal.br",
	contact_phone: "(82) 3214-1000",
	restrict_domains: false,
	allowed_domains: ["@ufal.br"],
	suspend_services: false,
};

/**
 * Schema para upsert de uma configuração (manager).
 */
export const UpsertAppSettingSchema = z.object({
	key: z.enum(APP_SETTINGS_KEYS),
	value: z.unknown(),
});

export type UpsertAppSettingInput = z.infer<typeof UpsertAppSettingSchema>;

// ─── Shift Definitions ───────────────────────────────────────────────────────

/**
 * Schema para uma definição de turno individual.
 */
const ShiftDefinitionEntrySchema = z.object({
	shift: z.enum(scholarShiftValues),
	dayOfWeek: z.enum(dayOfWeekValues),
	startTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:mm esperado"),
	endTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:mm esperado"),
	isEnabled: z.boolean().default(true),
});

/**
 * Schema para criar/atualizar definições de turno em lote (manager).
 * Substitui todas as definições existentes.
 */
export const UpsertShiftDefinitionsSchema = z.object({
	definitions: z.array(ShiftDefinitionEntrySchema),
});

export type UpsertShiftDefinitionsInput = z.infer<
	typeof UpsertShiftDefinitionsSchema
>;

export type ShiftDefinitionEntry = z.infer<typeof ShiftDefinitionEntrySchema>;

// ─── Scholar Shift Log ───────────────────────────────────────────────────────

/**
 * Schema para iniciar o turno (scholar).
 */
export const StartShiftLogSchema = z.object({
	shift: z.enum(scholarShiftValues),
});

export type StartShiftLogInput = z.infer<typeof StartShiftLogSchema>;

/**
 * Schema para encerrar o turno (scholar).
 */
export const EndShiftLogSchema = z.object({
	shiftLogId: z.string(),
});

export type EndShiftLogInput = z.infer<typeof EndShiftLogSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Retorna os horários padrão para cada turno.
 * Usado como fallback quando não há configuração no banco.
 */
export function getDefaultShiftTimes(): Record<
	(typeof scholarShiftValues)[number],
	{ startTime: string; endTime: string }
> {
	return {
		morning: { startTime: "07:00", endTime: "12:00" },
		afternoon: { startTime: "12:00", endTime: "17:00" },
		night: { startTime: "17:00", endTime: "22:00" },
	};
}
