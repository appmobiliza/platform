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

export const disabilityTypeLabels: Record<
	(typeof disabilityTypeValues)[number],
	string
> = {
	physical_disability: "Deficiência física",
	reduced_mobility: "Mobilidade reduzida",
	blindness: "Cegueira",
	low_vision: "Baixa visão",
	deafness: "Surdez",
	hard_of_hearing: "Dificuldade auditiva",
	deafblindness: "Surdocegueira",
	other: "Outra",
};

export type DisabilityTypeValues = (typeof disabilityTypeValues)[number];
