import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { studentProfile, scholarProfile } from "./profiles";
import { campusLocation } from "./locations";

/**
 * Ciclo de vida de uma solicitação de deslocamento.
 *
 * pending   → solicitação enviada, aguardando aceite de um bolsista
 * accepted  → bolsista aceitou, a caminho do ponto de origem
 * ongoing   → bolsista chegou e o deslocamento está em andamento
 * completed → deslocamento concluído com sucesso
 * cancelled → cancelada pelo estudante antes do início
 * unattended → expirou sem que nenhum bolsista aceitasse
 */
export const requestStatusEnum = pgEnum("request_status", [
  "pending",
  "accepted",
  "ongoing",
  "completed",
  "cancelled",
  "unattended",
]);

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

  originLocationId: integer("origin_location_id")
    .notNull()
    .references(() => campusLocation.id, { onDelete: "restrict" }),

  destinationLocationId: integer("destination_location_id")
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
