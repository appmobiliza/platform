import { dayOfWeekValues } from "@mobiliza/contracts";

import { pgEnum } from "drizzle-orm/pg-core";

export const dayOfWeekEnum = pgEnum("day_of_week", dayOfWeekValues);
