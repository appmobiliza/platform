import { genderValues } from "@mobiliza/contracts";
import { pgEnum } from "drizzle-orm/pg-core";

export const genderEnum = pgEnum("gender", genderValues);
