export const scholarShiftValues = ["morning", "afternoon", "night"] as const;
export type ScholarShiftValues = (typeof scholarShiftValues)[number];

export const scholarShiftLabels: Record<ScholarShiftValues, string> = {
	morning: "Manhã",
	afternoon: "Tarde",
	night: "Noite",
};

export type ScholarShift = ScholarShiftValues;

export function getCurrentShift(): ScholarShift {
	const currentHour = new Date().getHours();

	if (currentHour >= 6 && currentHour < 12) {
		return "morning";
	}

	if (currentHour >= 12 && currentHour < 18) {
		return "afternoon";
	}

	return "night";
}
