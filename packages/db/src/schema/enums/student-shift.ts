import { pgEnum } from "drizzle-orm/pg-core";

export const studentShiftValues = [
	"morning",
	"afternoon",
	"night",
	"full_day",
] as const;

export const studentShiftEnum = pgEnum("student_shift", studentShiftValues);
