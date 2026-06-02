import { pgEnum } from "drizzle-orm/pg-core";

export const genderValues = [
	"male",
	"female",
	"non_binary",
	"prefer_not_to_say",
] as const;

export const genderEnum = pgEnum("gender", genderValues);
