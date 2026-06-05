import { extraShiftRequestStatusValues } from "@mobiliza/contracts";

import { pgEnum } from "drizzle-orm/pg-core";

export const extraShiftRequestStatusEnum = pgEnum(
	"extra_shift_request_status",
	extraShiftRequestStatusValues,
);
