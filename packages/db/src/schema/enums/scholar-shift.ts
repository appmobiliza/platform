import { scholarShiftValues } from "@mobiliza/contracts";
import { pgEnum } from "drizzle-orm/pg-core";

export const scholarShiftEnum = pgEnum("scholar_shift", scholarShiftValues);
