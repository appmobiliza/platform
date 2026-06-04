export const dayOfWeekValues = [
	"sunday",
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
] as const;

export type DayOfWeekValues = (typeof dayOfWeekValues)[number];

export const dayOfWeekLabels: Record<DayOfWeekValues, string> = {
	sunday: "Domingo",
	monday: "Segunda-feira",
	tuesday: "Terça-feira",
	wednesday: "Quarta-feira",
	thursday: "Quinta-feira",
	friday: "Sexta-feira",
	saturday: "Sábado",
};
