import { disabilityTypeValues } from "@mobiliza/contracts";
import { pgEnum } from "drizzle-orm/pg-core";

export const disabilityTypeEnum = pgEnum(
	"disability_type",
	disabilityTypeValues,
);
