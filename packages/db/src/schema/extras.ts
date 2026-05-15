import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
  serial,
} from "drizzle-orm/pg-core";
import { studentProfile } from "./profiles";
import { serviceRequest } from "./requests";
import { campusLocation } from "./locations";
import { user } from "./auth";

/**
 * Mensagens de áudio enviadas durante uma solicitação.
 *
 * No fluxo atual do MobiUFAL, estudantes com deficiência visual enviam
 * áudios no WhatsApp para descrever sua solicitação. O Mobiliza mantém
 * esse paradigma: o estudante grava um áudio que é encaminhado ao bolsista,
 * sem transcrição automática na v1.
 *
 * O arquivo de áudio é armazenado em serviço externo (Supabase Storage
 * ou equivalente) e apenas a URL é persistida aqui.
 */
export const audioMessage = pgTable("audio_message", {
  id: text("id").primaryKey(),

  requestId: text("request_id")
    .notNull()
    .references(() => serviceRequest.id, { onDelete: "cascade" }),

  /*
   * URL pública ou assinada do arquivo de áudio no storage externo.
   */
  audioUrl: text("audio_url").notNull(),

  /*
   * Duração em segundos — útil para o bolsista saber o tamanho do áudio
   * antes de reproduzi-lo.
   */
  durationSeconds: integer("duration_seconds"),

  /*
   * Transcrição automática via Speech-to-Text — reservado para v2.
   * Mantido no schema desde o início para não exigir migração posterior.
   */
  transcription: text("transcription"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * Rotas favoritas salvas pelo estudante para agilizar solicitações futuras.
 * Uma rota favorita preenche automaticamente os campos de origem e destino
 * na tela de nova solicitação.
 */
export const favoriteRoute = pgTable("favorite_route", {
  id: serial("id").primaryKey(),

  studentProfileId: text("student_profile_id")
    .notNull()
    .references(() => studentProfile.id, { onDelete: "cascade" }),

  /*
   * Nome dado pelo estudante à rota. Ex: "Minha rota do almoço"
   */
  label: text("label").notNull(),

  originLocationId: integer("origin_location_id")
    .notNull()
    .references(() => campusLocation.id, { onDelete: "cascade" }),

  destinationLocationId: integer("destination_location_id")
    .notNull()
    .references(() => campusLocation.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * Tipos de notificação enviadas pelo sistema.
 */
export const notificationTypeEnum = pgEnum("notification_type", [
  "request_accepted",
  "request_unattended",
  "attendance_started",
  "attendance_completed",
  "scholar_approved",
  "scholar_rejected",
  "new_request_available",
]);

/**
 * Notificações enviadas a usuários pelo sistema.
 *
 * O registro aqui serve como fonte de verdade do histórico de notificações —
 * o disparo real (push notification, realtime event) é feito pelo adaptador
 * de realtime e não precisa ser rastreado nessa tabela.
 */
export const notification = pgTable("notification", {
  id: text("id").primaryKey(),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  type: notificationTypeEnum("type").notNull(),

  /*
   * Título e corpo da notificação — usados tanto para push notifications
   * quanto para o histórico na interface.
   */
  title: text("title").notNull(),
  body: text("body").notNull(),

  /*
   * Referência opcional ao recurso relacionado à notificação.
   * Ex: o id da serviceRequest que gerou o evento.
   */
  resourceId: text("resource_id"),

  isRead: boolean("is_read").notNull().default(false),
  readAt: timestamp("read_at"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type AudioMessage = typeof audioMessage.$inferSelect;
export type NewAudioMessage = typeof audioMessage.$inferInsert;
export type FavoriteRoute = typeof favoriteRoute.$inferSelect;
export type NewFavoriteRoute = typeof favoriteRoute.$inferInsert;
export type Notification = typeof notification.$inferSelect;
export type NewNotification = typeof notification.$inferInsert;
