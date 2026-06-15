import { Text, View } from "react-native";

import type { ScheduleDay } from "./types";

interface ScheduleHeaderProps {
	days: ScheduleDay[];
	/** Index of the day to highlight (e.g. today). Optional. */
	activeIndex?: number;
	/**
	 * Width of the left gutter (in Tailwind units) used to align the days
	 * with the schedule grid below. Defaults to "w-16".
	 */
	gutterClassName?: string;
}

/**
 * Reusable weekly header showing weekday + day-of-month columns.
 * Split out from the schedule so it can be reused across screens.
 */
export function ScheduleHeader({
	days,
	activeIndex,
	gutterClassName = "w-16",
}: ScheduleHeaderProps) {
	return (
		<View className="flex-row bg-muted px-4 py-6">
			{/* Left gutter keeps the day columns aligned with the grid below */}
			<View className={gutterClassName} />

			<View className="flex-1 flex-row gap-3">
				{days.map((day, index) => {
					const isActive = index === activeIndex;
					return (
						<View
							key={`${day.weekday}-${day.day}`}
							className="flex-1 items-center"
						>
							<Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								{day.weekday}
							</Text>
							<Text
								className={
									isActive
										? "mt-1 text-3xl font-bold text-foreground"
										: "mt-1 text-3xl font-bold text-foreground"
								}
							>
								{day.day}
							</Text>
							{isActive ? (
								<View className="mt-1 h-1 w-6 rounded-full bg-foreground" />
							) : null}
						</View>
					);
				})}
			</View>
		</View>
	);
}
