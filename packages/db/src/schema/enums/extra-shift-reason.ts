import { extraShiftReasonValues } from "@mobiliza/contracts";

import { pgEnum } from "drizzle-orm/pg-core";

export const extraShiftReasonEnum = pgEnum(
	"extra_shift_reason",
	extraShiftReasonValues,
);
