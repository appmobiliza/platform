export const genderValues = [
	"male",
	"female",
	"non_binary",
	"prefer_not_to_say",
] as const;

export type GenderValues = (typeof genderValues)[number];

export const genderLabels: Record<GenderValues, string> = {
	male: "Masculino",
	female: "Feminino",
	non_binary: "Não binário",
	prefer_not_to_say: "Prefiro não dizer",
};
