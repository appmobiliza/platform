import {
  pgTable,
  text,
  timestamp,
  boolean,
  serial,
  doublePrecision,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { studentProfile } from "./profiles";

/**
 * Pontos de referência fixos do campus utilizados como origem e destino
 * nas solicitações de deslocamento.
 *
 * A lista é gerenciada pela coordenação do NAC via dashboard.
 * O sistema trabalha com pontos nomeados pré-cadastrados, o que simplifica
 * a experiência para usuários com deficiência visual (seleção por nome/áudio).
 * Cada ponto possui coordenadas geográficas (latitude/longitude) para
 * referência espacial — sem geolocalização em tempo real.
 */
export const campusLocation = pgTable("campus_location", {
  id: serial("id").primaryKey(),

  /*
   * Nome completo exibido na interface e lido pelo leitor de tela.
   * Ex: "Instituto de Computação", "Restaurante Universitário"
   */
  name: text("name").notNull(),

  /*
   * Abreviação usada em listagens compactas e no histórico de atendimentos.
   * Ex: "IC", "RU", "Biblioteca"
   */
  abbreviation: text("abbreviation").notNull(),

  /*
   * Descrição de como chegar ao local ou referências úteis para
   * áudio descrição. Opcional — pode ser preenchida conforme o NAC
   * for mapeando os pontos.
   */
  description: text("description"),

  /*
   * Coordenadas geográficas do local no campus.
   */
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),

  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Rotas frequentes salvas pelo estudante para agilizar solicitações.
 */
export const favoriteRoute = pgTable("favorite_route", {
  id: text("id").primaryKey(),
  
  studentProfileId: text("student_profile_id")
    .notNull()
    .references(() => studentProfile.id, { onDelete: "cascade" }),
    
  originLocationId: integer("origin_location_id")
    .notNull()
    .references(() => campusLocation.id, { onDelete: "restrict" }),
    
  destinationLocationId: integer("destination_location_id")
    .notNull()
    .references(() => campusLocation.id, { onDelete: "restrict" }),
    
  name: text("name").notNull(),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type CampusLocation = typeof campusLocation.$inferSelect;
export type NewCampusLocation = typeof campusLocation.$inferInsert;
export type FavoriteRoute = typeof favoriteRoute.$inferSelect;
export type NewFavoriteRoute = typeof favoriteRoute.$inferInsert;

export const favoriteRouteRelations = relations(favoriteRoute, ({ one }) => ({
  studentProfile: one(studentProfile, {
    fields: [favoriteRoute.studentProfileId],
    references: [studentProfile.id],
  }),
  originLocation: one(campusLocation, {
    fields: [favoriteRoute.originLocationId],
    references: [campusLocation.id],
    relationName: "favoriteOrigin",
  }),
  destinationLocation: one(campusLocation, {
    fields: [favoriteRoute.destinationLocationId],
    references: [campusLocation.id],
    relationName: "favoriteDestination",
  }),
}));
