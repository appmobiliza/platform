/** A scholar identifier — can be a name, ID, or any string. */
export type PersonId = string

/** A single day shown in the schedule header. */
export interface ScheduleDay {
	/** Short weekday label, e.g. "SEG". */
	weekday: string
	/** Day of month, e.g. "30". */
	day: string
}

/** A filled cell: a person assigned to a time range. */
export interface ScheduleEntry {
	person: PersonId
	/** Time range shown inside the card, e.g. "07-12h". */
	time: string
}

/**
 * A time slot section (e.g. "07-12h").
 * `cells` is a matrix of rows x columns. Columns map 1:1 to the days array.
 * A `null` cell renders an empty (dashed) placeholder.
 */
export interface ScheduleSlot {
	id: string
	/** Label shown on the left gutter, e.g. "07-12h". */
	label: string
	cells: (ScheduleEntry | null)[][]
}
