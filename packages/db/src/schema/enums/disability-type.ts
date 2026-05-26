import { pgEnum } from "drizzle-orm/pg-core";

export const disabilityTypeValues = [
  "physical_disability",
  "reduced_mobility",
  "blindness",
  "low_vision",
  "deafness",
  "hard_of_hearing",
  "deafblindness",
  "other",
] as const;

export const disabilityTypeEnum = pgEnum(
  "disability_type",
  disabilityTypeValues,
);