import { roleValues } from "@mobiliza/contracts";
import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", roleValues);
