export const studentShiftValues = [
	"morning",
	"afternoon",
	"night",
	"full_day",
] as const;

export type StudentShiftValues = (typeof studentShiftValues)[number];

export const studentShiftLabels: Record<StudentShiftValues, string> = {
	morning: "Matutino",
	afternoon: "Vespertino",
	night: "Noturno",
	full_day: "Integral",
};
