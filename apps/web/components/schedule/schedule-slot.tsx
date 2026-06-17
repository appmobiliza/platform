import type { PersonColor } from "./colors";
import { ScheduleCard } from "./schedule-card";
import type { ScheduleEntry, ScheduleSlot as ScheduleSlotType } from "./types";

interface ScheduleSlotProps {
	slot: ScheduleSlotType;
	onEntryPress?: (entry: ScheduleEntry) => void;
	gutterClassName?: string;
	colorMap?: Map<string, PersonColor>;
}

/**
 * One time-slot section: a left label gutter plus a grid of rows/columns.
 * Columns align with the header days; rows stack vertically.
 */
export function ScheduleSlot({
	slot,
	onEntryPress,
	gutterClassName = "w-16",
	colorMap,
}: ScheduleSlotProps) {
	return (
		<div className="flex flex-row px-4 py-4">
			{/* Left gutter with the time-range label */}
			<div className={`${gutterClassName} pt-1`}>
				<span className="text-sm font-medium text-muted-foreground">
					{slot.label}
				</span>
			</div>

			{/* Grid of cards */}
			<div className="flex flex-1 flex-col gap-3">
				{slot.cells.map((row, rowIndex) => (
					<div
						key={`${slot.id}-row-${rowIndex}`}
						className="flex flex-row gap-3"
					>
						{row.map((entry, colIndex) => (
							<ScheduleCard
								key={`${slot.id}-${rowIndex}-${colIndex}`}
								entry={entry}
								onPress={onEntryPress}
								colorMap={colorMap}
							/>
						))}
					</div>
				))}
			</div>
		</div>
	);
}
