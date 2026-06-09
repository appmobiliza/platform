import type { ShiftDefinitionEntry } from "../settings";

export const scholarShiftValues = ["morning", "afternoon", "night"] as const;
export type ScholarShiftValues = (typeof scholarShiftValues)[number];

export const scholarShiftLabels: Record<ScholarShiftValues, string> = {
	morning: "Manhã",
	afternoon: "Tarde",
	night: "Noite",
};

export type ScholarShift = ScholarShiftValues;

/**
 * Determina o turno atual baseado no horário do sistema.
 * Usa horários fixos padrão (6h-12h matutino, 12h-18h vespertino, 18h+ noturno).
 *
 * Para uma versão configurável, use `getCurrentShiftFromDefinitions()`.
 */
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

/**
 * Determina o turno atual baseado nas definições configuradas pelo gestor.
 * Retorna null se não estiver em nenhum turno ativo no momento.
 */
export function getCurrentShiftFromDefinitions(
	definitions: ShiftDefinitionEntry[],
): { shift: ScholarShiftValues; startTime: string; endTime: string } | null {
	const now = new Date();
	const dayNames = [
		"sunday",
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday",
	];
	const currentDay = dayNames[now.getDay()]!;
	const currentMinutes = now.getHours() * 60 + now.getMinutes();

	const todayDefinitions = definitions.filter(
		(def) => def.dayOfWeek === currentDay && def.isEnabled,
	);

	for (const def of todayDefinitions) {
		const [startH, startM] = def.startTime.split(":").map(Number);
		const [endH, endM] = def.endTime.split(":").map(Number);
		const startMinutes = startH! * 60 + startM!;
		const endMinutes = endH! * 60 + endM!;

		if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
			return {
				shift: def.shift,
				startTime: def.startTime,
				endTime: def.endTime,
			};
		}
	}

	return null;
}
