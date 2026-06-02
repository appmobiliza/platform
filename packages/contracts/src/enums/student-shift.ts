export const studentShiftValues = [
	"morning",
	"afternoon",
	"night",
	"full_day",
] as const;

export type StudentShiftValues = (typeof studentShiftValues)[number];
