import { courseValues } from "@mobiliza/contracts";
import { pgEnum } from "drizzle-orm/pg-core";

export const courseEnum = pgEnum("course", courseValues);
