import { Text, View } from "react-native";

import { ScheduleCard } from "./schedule-card";
import type { ScheduleEntry, ScheduleSlot as ScheduleSlotType } from "./types";

interface ScheduleSlotProps {
	slot: ScheduleSlotType;
	onEntryPress?: (entry: ScheduleEntry) => void;
	gutterClassName?: string;
}

/**
 * One time-slot section: a left label gutter plus a grid of rows/columns.
 * Columns align with the header days; rows stack vertically.
 */
export function ScheduleSlot({
	slot,
	onEntryPress,
	gutterClassName = "w-16",
}: ScheduleSlotProps) {
	return (
		<View className="flex-row px-4 py-4">
			{/* Left gutter with the time-range label */}
			<View className={`${gutterClassName} pt-1`}>
				<Text className="text-sm font-medium text-neutral-500">
					{slot.label}
				</Text>
			</View>

			{/* Grid of cards */}
			<View className="flex-1 gap-3">
				{slot.cells.map((row, rowIndex) => (
					<View
						key={`${slot.id}-row-${rowIndex}`}
						className="flex-row gap-3"
					>
						{row.map((entry, colIndex) => (
							<ScheduleCard
								key={`${slot.id}-${rowIndex}-${colIndex}`}
								entry={entry}
								onPress={onEntryPress}
							/>
						))}
					</View>
				))}
			</View>
		</View>
	);
}
