import { pgEnum } from "drizzle-orm/pg-core";

export const courseValues = [
  "Pedagogia",
  "Ciência da Computação",
  "Engenharia Civil",
  "Direito",
  "Medicina",
] as const;

export const courseEnum = pgEnum("course", courseValues);