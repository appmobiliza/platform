export const genderValues = [
	"male",
	"female",
	"non_binary",
	"prefer_not_to_say",
] as const;

export type GenderValues = (typeof genderValues)[number];
