import { studentShiftValues } from "@mobiliza/contracts";
import { pgEnum } from "drizzle-orm/pg-core";

export const studentShiftEnum = pgEnum("student_shift", studentShiftValues);
