import { pgEnum } from "drizzle-orm/pg-core";

export const roleValues = ["student", "scholar", "manager"] as const;

export const roleEnum = pgEnum("role", roleValues);
