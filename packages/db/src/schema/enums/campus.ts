import { pgEnum } from "drizzle-orm/pg-core";

export const campusValues = [
  "Campus A.C. Simões",
  "Campus CECA",
  "Campus Arapiraca",
  "Campus Sertão",
] as const;

export const campusEnum = pgEnum("campus", campusValues);