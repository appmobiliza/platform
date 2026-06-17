"use client";

import { cn } from "@/lib/utils";

import { getPersonColor, type PersonColor } from "./colors";
import type { ScheduleEntry } from "./types";

interface ScheduleCardProps {
	/** When null, renders an empty dashed placeholder. */
	entry: ScheduleEntry | null;
	onPress?: (entry: ScheduleEntry) => void;
	colorMap?: Map<string, PersonColor>;
}

/** A single grid cell: either a colored person card or an empty placeholder. */
export function ScheduleCard({ entry, onPress, colorMap }: ScheduleCardProps) {
	if (!entry) {
		return (
			<div className="min-h-24 flex-1 rounded-2xl border border-dashed border-border" />
		);
	}

	const color = getPersonColor(entry.person, colorMap);

	return (
		<button
			type="button"
			disabled={!onPress}
			onClick={() => onPress?.(entry)}
			className={cn(
				"min-h-24 flex-1 rounded-2xl p-3 text-left",
				"flex flex-col items-start justify-start",
				color.bg,
				onPress ? "cursor-pointer" : "cursor-default",
				"disabled:opacity-100",
				"active:opacity-80",
			)}
		>
			<span className="text-base font-bold leading-tight text-white">
				{entry.person}
			</span>
			<span className="mt-1 block text-sm font-medium text-white/90">
				{entry.time}
			</span>
		</button>
	);
}
