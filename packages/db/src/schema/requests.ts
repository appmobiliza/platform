import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { requestStatusEnum } from "./enums";
import { campusLocation } from "./locations";
import { scholarProfile, studentProfile } from "./profiles";

/**
 * Solicitação de deslocamento criada pelo estudante com deficiência.
 *
 * Uma solicitação existe independentemente de haver ou não um atendimento
 * associado — o atendimento é criado apenas quando um bolsista aceita.
 * Isso permite registrar e analisar solicitações não atendidas (unattended),
 * que são um indicador operacional importante para o NAC.
 */
export const serviceRequest = pgTable("service_request", {
	id: text("id").primaryKey(),

	studentProfileId: text("student_profile_id")
		.notNull()
		.references(() => studentProfile.id, { onDelete: "restrict" }),

	originLocationId: text("origin_location_id")
		.notNull()
		.references(() => campusLocation.id, { onDelete: "restrict" }),

	destinationLocationId: text("destination_location_id")
		.notNull()
		.references(() => campusLocation.id, { onDelete: "restrict" }),

	status: requestStatusEnum("status").notNull().default("pending"),

	/*
	 * Observação opcional do estudante para o bolsista sobre esse
	 * deslocamento específico — diferente das notas permanentes do perfil.
	 * Ex: "Estou na entrada principal do bloco A"
	 */
	notes: text("notes"),

	/*
	 * Registra quando a solicitação passou de pending para outro estado,
	 * permitindo calcular o tempo de espera (tempo até o primeiro aceite).
	 */
	respondedAt: timestamp("responded_at"),

	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Atendimento vinculado a uma solicitação aceita por um bolsista.
 *
 * Separar request e attendance permite:
 * 1. Registrar solicitações não atendidas sem criar um attendance vazio
 * 2. Calcular métricas separadas de tempo de espera e tempo de deslocamento
 * 3. Manter o histórico mesmo que o modelo de atendimento mude no futuro
 */
export const serviceAttendance = pgTable("service_attendance", {
	id: text("id").primaryKey(),

	requestId: text("request_id")
		.notNull()
		.unique()
		.references(() => serviceRequest.id, { onDelete: "restrict" }),

	scholarProfileId: text("scholar_profile_id")
		.notNull()
		.references(() => scholarProfile.id, { onDelete: "restrict" }),

	/*
	 * Timestamps granulares para métricas operacionais do NAC:
	 * - acceptedAt: quando o bolsista aceitou
	 * - startedAt: quando o deslocamento efetivamente começou
	 * - completedAt: quando o deslocamento foi concluído
	 *
	 * A diferença entre acceptedAt e startedAt é o tempo de deslocamento
	 * do bolsista até o ponto de origem do estudante.
	 * A diferença entre startedAt e completedAt é a duração do deslocamento.
	 */
	acceptedAt: timestamp("accepted_at").notNull().defaultNow(),
	startedAt: timestamp("started_at"),
	completedAt: timestamp("completed_at"),

	/*
	 * Duração em segundos, calculada e armazenada na conclusão para
	 * evitar recálculos em queries de relatório.
	 */
	durationSeconds: integer("duration_seconds"),

	/*
	 * Avaliação do estudante sobre o atendimento (1-5).
	 * Opcional — o estudante pode ou não avaliar após a conclusão.
	 */
	rating: integer("rating"),
	ratingComment: text("rating_comment"),

	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ServiceRequest = typeof serviceRequest.$inferSelect;
export type NewServiceRequest = typeof serviceRequest.$inferInsert;
export type ServiceAttendance = typeof serviceAttendance.$inferSelect;
export type NewServiceAttendance = typeof serviceAttendance.$inferInsert;

// ─── Relations ───────────────────────────────────────────────────────────────

export const serviceRequestRelations = relations(serviceRequest, ({ one }) => ({
	studentProfile: one(studentProfile, {
		fields: [serviceRequest.studentProfileId],
		references: [studentProfile.id],
	}),
	originLocation: one(campusLocation, {
		fields: [serviceRequest.originLocationId],
		references: [campusLocation.id],
		relationName: "originLocation",
	}),
	destinationLocation: one(campusLocation, {
		fields: [serviceRequest.destinationLocationId],
		references: [campusLocation.id],
		relationName: "destinationLocation",
	}),
	attendance: one(serviceAttendance, {
		fields: [serviceRequest.id],
		references: [serviceAttendance.requestId],
		relationName: "serviceAttendance",
	}),
}));

export const serviceAttendanceRelations = relations(
	serviceAttendance,
	({ one }) => ({
		request: one(serviceRequest, {
			fields: [serviceAttendance.requestId],
			references: [serviceRequest.id],
			relationName: "serviceAttendance",
		}),
		scholarProfile: one(scholarProfile, {
			fields: [serviceAttendance.scholarProfileId],
			references: [scholarProfile.id],
		}),
	}),
);
