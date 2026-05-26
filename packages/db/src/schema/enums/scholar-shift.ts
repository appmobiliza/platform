import { pgEnum } from "drizzle-orm/pg-core";

export const scholarShiftValues = ["morning", "afternoon", "night"] as const;

export const scholarShiftEnum = pgEnum("scholar_shift", scholarShiftValues);