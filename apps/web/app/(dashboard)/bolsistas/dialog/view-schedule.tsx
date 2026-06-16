"use client";

import { Loader2 } from "lucide-react";
import * as React from "react";

import {
	Schedule,
	type ScheduleDay,
	ScheduleHeader,
	type ScheduleSlotType,
} from "@/components/schedule";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { trpc } from "@/providers/trpc-provider";

// ─── Helpers ─────────────────────────────────────────────────────────

const WEEKDAY_LABELS: Record<string, string> = {
	monday: "SEG",
	tuesday: "TER",
	wednesday: "QUA",
	thursday: "QUI",
	friday: "SEX",
};

const SHIFT_CONFIG = [
	{ id: "07-12h", label: "07-12h", apiKey: "morning" },
	{ id: "12-17h", label: "12-17h", apiKey: "afternoon" },
	{ id: "17-22h", label: "17-22h", apiKey: "night" },
] as const;

/** Compute Monday–Friday as ScheduleDay[] for the current week. */
function getCurrentWeekDays(): ScheduleDay[] {
	const today = new Date();
	const currentDay = today.getDay();
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

interface ApiScheduleEntry {
	dayOfWeek: string;
	shift: string;
}

interface ApiSchedule {
	name: string;
	schedule: ApiScheduleEntry[];
}

const DAY_ORDER = [
	"sunday",
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
] as const;

const MON_IDX = 1; // index of monday in DAY_ORDER
const FRI_IDX = 5; // index of friday in DAY_ORDER

/**
 * Transform API schedules into ScheduleSlotType[] for rendering.
 * Mirrors the mobile app's transformSchedulesToSlots.
 */
function transformSchedulesToSlots(
	schedules: ApiSchedule[],
): ScheduleSlotType[] {
	return SHIFT_CONFIG.map((shift) => {
		// Collect which scholars work on which weekdays (mon–fri)
		const scholarDays = schedules
			.map((s) => {
				const days: number[] = [];
				for (const entry of s.schedule) {
					if (entry.shift !== shift.apiKey) continue;
					const idx = DAY_ORDER.indexOf(
						entry.dayOfWeek as (typeof DAY_ORDER)[number],
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

		const dayIndices = Array.from(
			{ length: FRI_IDX - MON_IDX + 1 },
			(_, i) => MON_IDX + i,
		);
		const maxPerDay = Math.max(
			...dayIndices.map(
				(dayIdx) =>
					scholarDays.filter((s) => s.days.has(dayIdx)).length,
			),
			1,
		);

		// Greedy packing: assign each scholar to the first row without day conflicts
		const rows: { name: string; days: Set<number> }[][] = Array.from(
			{ length: maxPerDay },
			() => [],
		);

		for (const scholar of scholarDays) {
			let assigned = false;
			for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
				const currentRow = rows[rowIdx];
				if (!currentRow) continue;
				const hasConflict = currentRow.some((existing) =>
					[...scholar.days].some((day) => existing.days.has(day)),
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
			cells: rows.map((row) =>
				Array.from({ length: FRI_IDX - MON_IDX + 1 }, (_, colIdx) => {
					const dayIdx = MON_IDX + colIdx;
					const scholar = row.find((s) => s.days.has(dayIdx));
					return scholar
						? { person: scholar.name, time: shift.label }
						: null;
				}),
			),
		};
	});
}

// ─── Component ────────────────────────────────────────────────────────

interface Props {
	children: React.ReactNode;
}

export function ViewScheduleDialog({ children }: Props) {
	const [open, setOpen] = React.useState(false);
	const { data: schedules, isLoading } = trpc.profiles.getSchedules.useQuery(
		undefined,
		{
			enabled: open,
		},
	);

	const days = React.useMemo(() => getCurrentWeekDays(), []);

	const slots: ScheduleSlotType[] = React.useMemo(
		() => (schedules ? transformSchedulesToSlots(schedules) : []),
		[schedules],
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>

			<DialogContent className="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
				<div className="p-6 pb-0">
					<DialogHeader>
						<DialogTitle>Grade de bolsistas</DialogTitle>
						<DialogDescription>
							Distribuição semanal dos bolsistas por turno e dia
						</DialogDescription>
					</DialogHeader>
				</div>

				<Separator className="my-4 shrink-0" />

				<div className="flex-1 overflow-y-auto overflow-x-hidden">
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="size-6 animate-spin text-muted-foreground" />
						</div>
					) : !schedules || schedules.length === 0 ? (
						<p className="py-12 text-center text-sm text-muted-foreground">
							Nenhum bolsista cadastrado.
						</p>
					) : (
						<>
							<ScheduleHeader days={days} />
							<Schedule slots={slots} showLegend />
						</>
					)}
				</div>

				<DialogFooter className="-m-1">
					<DialogClose asChild>
						<Button variant="outline">Fechar</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
