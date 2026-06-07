import { relations } from "drizzle-orm";
import {
	boolean,
	jsonb,
	pgTable,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";

import { dayOfWeekEnum, scholarShiftEnum } from "./enums";

/**
 * Tabela chave-valor para configurações gerais do sistema.
 *
 * Cada linha armazena uma chave única e seu valor em JSONB, permitindo
 * armazenar desde valores escalares (string, número) até objetos complexos
 * (configuração de domínios permitidos, etc).
 *
 * As chaves são definidas em `appSettingsKeys` e devem ser documentadas
 * conforme forem adicionadas.
 *
 * Chaves previstas:
 * - `maxServiceRequestTime`  → número (minutos) — tempo máximo sem resposta
 * - `institution_name`       → string — nome da instituição (ex: "UFAL")
 * - `contact_email`          → string — e-mail de contato do NAC
 * - `contact_phone`          → string — telefone de contato do NAC
 * - `restrict_domains`       → boolean — se há restrição de domínios
 * - `allowed_domains`        → string[] — lista de domínios permitidos
 * - `suspend_services`       → boolean — se o sistema está suspenso
 */
export const appSettings = pgTable("app_settings", {
	key: text("key").primaryKey(),

	/*
	 * Valor da configuração em JSONB.
	 * Ex: para maxServiceRequestTime: 10 (número)
	 *     para institution_name: "Universidade Federal de Alagoas (UFAL)"
	 */
	value: jsonb("value").notNull(),

	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Definição de turnos do sistema — configuração global gerenciada pelo gestor.
 *
 * Define para cada turno (matutino, vespertino, noturno) e dia da semana:
 * - Se está habilitado
 * - Horário de início e término
 *
 * Essa configuração é usada para determinar o turno vigente e também
 * serve como base para a grade horária que os bolsistas definem.
 *
 * A restrição única (shift + dayOfWeek) garante que cada combinação
 * apareça apenas uma vez.
 */
export const shiftDefinition = pgTable(
	"shift_definition",
	{
		id: text("id").primaryKey(),

		shift: scholarShiftEnum("shift").notNull(),
		dayOfWeek: dayOfWeekEnum("day_of_week").notNull(),

		/*
		 * Horário de início do turno no formato "HH:mm".
		 * Ex: "07:00", "12:00", "17:00"
		 */
		startTime: text("start_time").notNull(),

		/*
		 * Horário de término do turno no formato "HH:mm".
		 * Ex: "12:00", "17:00", "22:00"
		 */
		endTime: text("end_time").notNull(),

		/*
		 * Define se este turno está ativo no sistema.
		 * Turnos desativados não aparecem para seleção de bolsistas
		 * e não são considerados na determinação do turno atual.
		 */
		isEnabled: boolean("is_enabled").notNull().default(true),

		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [unique().on(table.shift, table.dayOfWeek)],
);

export type AppSetting = typeof appSettings.$inferSelect;
export type NewAppSetting = typeof appSettings.$inferInsert;
export type ShiftDefinition = typeof shiftDefinition.$inferSelect;
export type NewShiftDefinition = typeof shiftDefinition.$inferInsert;

// ─── Relations ───────────────────────────────────────────────────────────────

export const shiftDefinitionRelations = relations(shiftDefinition, () => ({}));
