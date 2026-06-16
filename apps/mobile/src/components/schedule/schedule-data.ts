import type { ScheduleDay, ScheduleSlot } from "./types";

/** Raw API schedule entry for a single scholar. */
interface ApiScheduleEntry {
	dayOfWeek: string;
	shift: string;
}

/** Raw API response item for a scholar's schedule. */
interface ApiSchedule {
	name: string;
	schedule: ApiScheduleEntry[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DAY_ORDER = [
	"sunday",
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
] as const;

const WEEKDAY_LABELS: Record<string, string> = {
	sunday: "DOM",
	monday: "SEG",
	tuesday: "TER",
	wednesday: "QUA",
	thursday: "QUI",
	friday: "SEX",
	saturday: "SAB",
};

const SHIFT_CONFIG = [
	{ id: "07-12h", label: "07-12h", apiKey: "morning" },
	{ id: "12-17h", label: "12-17h", apiKey: "afternoon" },
	{ id: "17-22h", label: "17-22h", apiKey: "night" },
] as const;

/** Index of monday in DAY_ORDER. */
const MON_IDX = 1;
/** Index of friday in DAY_ORDER. */
const FRI_IDX = 5;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Get the current week's monday–friday as ScheduleDay[]. */
export function getCurrentWeekDays(): ScheduleDay[] {
	const today = new Date();
	const currentDay = today.getDay(); // 0=Sunday
	const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
	const monday = new Date(today);
	monday.setDate(today.getDate() + mondayOffset);

	const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday"];

	return dayKeys.map((dayKey, index) => {
		const date = new Date(monday);
		date.setDate(monday.getDate() + index);
		return {
			weekday: WEEKDAY_LABELS[dayKey] ?? dayKey.slice(0, 3).toUpperCase(),
			day: String(date.getDate()).padStart(2, "0"),
		};
	});
}

/** Internal representation of a scholar's working days in a shift. */
interface ScholarDayEntry {
	name: string;
	days: Set<number>;
}

/**
 * Transform the API schedules response into ScheduleSlot[] for rendering.
 *
 * For each shift (morning/afternoon/night), we collect which scholars work on
 * which days (mon–fri), then arrange them into rows. Each row can hold one
 * scholar per day; multiple rows allow multiple scholars on the same day.
 */
export function transformSchedulesToSlots(
	schedules: ApiSchedule[],
): ScheduleSlot[] {
	return SHIFT_CONFIG.map((shift) => {
		// For each scholar, collect which weekdays (mon–fri) they work
		const scholarDays: ScholarDayEntry[] = schedules
			.map((s): ScholarDayEntry => {
				const days: number[] = [];
				for (const entry of s.schedule) {
					if (entry.shift !== shift.apiKey) continue;
					const idx = DAY_ORDER.indexOf(
						entry.dayOfWeek as typeof DAY_ORDER[number],
					);
					if (idx >= MON_IDX && idx <= FRI_IDX) {
						days.push(idx);
					}
				}
				return { name: s.name, days: new Set(days) };
			})
			.filter((s) => s.days.size > 0);

		if (scholarDays.length === 0) {
			return { id: shift.id, label: shift.label, cells: [] };
		}

		// Determine how many rows we need (max scholars per day)
		const dayIndices = Array.from(
			{ length: FRI_IDX - MON_IDX + 1 },
			(_, i) => MON_IDX + i,
		);
		const maxPerDay = Math.max(
			...dayIndices.map((dayIdx: number) =>
				scholarDays.filter((s: ScholarDayEntry) => s.days.has(dayIdx))
					.length,
			),
			1,
		);

		// Greedy packing: assign each scholar to the first row without day conflicts
		const rows: ScholarDayEntry[][] = Array.from(
			{ length: maxPerDay },
			(): ScholarDayEntry[] => [],
		);

		for (const scholar of scholarDays) {
			let assigned = false;
			for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
				const currentRow = rows[rowIdx];
				if (!currentRow) continue;
				const hasConflict = currentRow.some(
					(existing: ScholarDayEntry) =>
						[...scholar.days].some((day: number) =>
							existing.days.has(day),
						),
				);
				if (!hasConflict) {
					currentRow.push(scholar);
					assigned = true;
					break;
				}
			}
			if (!assigned) {
				rows.push([scholar]);
			}
		}

		return {
			id: shift.id,
			label: shift.label,
			cells: rows.map((row: ScholarDayEntry[]) =>
				Array.from(
					{ length: FRI_IDX - MON_IDX + 1 },
					(_unused: unknown, colIdx: number) => {
						const dayIdx = MON_IDX + colIdx;
						const scholar = row.find(
							(s: ScholarDayEntry) => s.days.has(dayIdx),
						);
						return scholar
							? { person: scholar.name, time: shift.label }
							: null;
					},
				),
			),
		};
	});
}
