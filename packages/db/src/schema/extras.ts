import {
  pgTable,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { serviceRequest } from "./requests";
import { user } from "./auth";
import { notificationTypeEnum } from "./enums";

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
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

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

  readAt: timestamp("read_at"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type AudioMessage = typeof audioMessage.$inferSelect;
export type NewAudioMessage = typeof audioMessage.$inferInsert;
export type Notification = typeof notification.$inferSelect;
export type NewNotification = typeof notification.$inferInsert;
