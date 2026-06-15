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
		<div className="flex flex-row bg-muted px-4 py-6">
			{/* Left gutter keeps the day columns aligned with the grid below */}
			<div className={gutterClassName} />

			<div className="flex flex-1 flex-row gap-3">
				{days.map((day, index) => {
					const isActive = index === activeIndex;
					return (
						<div
							key={`${day.weekday}-${day.day}`}
							className="flex flex-1 flex-col items-center"
						>
							<span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								{day.weekday}
							</span>
							<span className="mt-1 text-3xl font-bold text-foreground">
								{day.day}
							</span>
							{isActive ? (
								<div className="mt-1 h-1 w-6 rounded-full bg-foreground" />
							) : null}
						</div>
					);
				})}
			</div>
		</div>
	);
}
