import { requestStatusValues } from "@mobiliza/contracts";

import { pgEnum } from "drizzle-orm/pg-core";

export const requestStatusEnum = pgEnum("request_status", requestStatusValues);
