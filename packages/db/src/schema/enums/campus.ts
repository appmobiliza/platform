import { campusValues } from "@mobiliza/contracts";
import { pgEnum } from "drizzle-orm/pg-core";

export const campusEnum = pgEnum("campus", campusValues);
