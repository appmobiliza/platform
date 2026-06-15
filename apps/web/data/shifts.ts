export type ShiftId = "MAT" | "VES" | "NOT"
export type DayId = "Seg" | "Ter" | "Qua" | "Qui" | "Sex"
export type CoverageStatus = "empty" | "mid" | "full" | "editing"

export const DAYS: DayId[] = ["Seg", "Ter", "Qua", "Qui", "Sex"]

export const DAY_LABEL: Record<DayId, string> = {
  Seg: "SEG",
  Ter: "TER",
  Qua: "QUA",
  Qui: "QUI",
  Sex: "SEX",
}

export interface ShiftDef {
  id: ShiftId
  label: string
  range: string
  hours: number
  /** lucide icon name used by the legend / header */
  icon: "sunrise" | "sun" | "moon"
  /** css color token name without the leading -- */
  token: "success" | "warning" | "info"
}

export const SHIFTS: ShiftDef[] = [
  { id: "MAT", label: "Matutino", range: "07-12h", hours: 5, icon: "sunrise", token: "success" },
  { id: "VES", label: "Vespertino", range: "12-17h", hours: 5, icon: "sun", token: "warning" },
  { id: "NOT", label: "Noturno", range: "17-22h", hours: 5, icon: "moon", token: "info" },
]

export const SHIFT_BY_ID: Record<ShiftId, ShiftDef> = Object.fromEntries(
  SHIFTS.map((s) => [s.id, s]),
) as Record<ShiftId, ShiftDef>

/** Weekly hour limit for a single scholarship holder. */
export const WEEKLY_LIMIT = 15

export interface Student {
  name: string
  registration: string
  initials: string
}

export const STUDENT: Student = {
  name: "Lucas Carvalho",
  registration: "2021043210",
  initials: "LC",
}

/** A selected cell key: `${day}-${shift}` */
export const cellKey = (day: DayId, shift: ShiftId) => `${day}-${shift}` as const

/** Default shifts already assigned to the student being edited. */
export const DEFAULT_SELECTED: string[] = [
  cellKey("Seg", "NOT"),
  cellKey("Ter", "VES"),
  cellKey("Qua", "MAT"),
  cellKey("Qua", "NOT"),
  cellKey("Qui", "MAT"),
  cellKey("Sex", "VES"),
]

/**
 * Coverage of OTHER scholarship holders (the student being edited is not
 * counted here). The live coverage adds +1 wherever this student is assigned.
 */
export const BASE_COVERAGE: Record<ShiftId, Record<DayId, number>> = {
  MAT: { Seg: 0, Ter: 3, Qua: 1, Qui: 2, Sex: 2 },
  VES: { Seg: 3, Ter: 2, Qua: 2, Qui: 2, Sex: 2 },
  NOT: { Seg: 2, Ter: 1, Qua: 1, Qui: 3, Sex: 1 },
}

export function coverageStatus(count: number, isEditing: boolean): CoverageStatus {
  if (isEditing) return "editing"
  if (count <= 1) return "empty"
  if (count === 2) return "mid"
  return "full"
}
