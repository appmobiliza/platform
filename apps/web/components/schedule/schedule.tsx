import { Fragment } from "react";

import { Separator } from "@/components/ui/separator";

import { ScheduleLegend } from "./schedule-legend";
import { ScheduleSlot } from "./schedule-slot";
import type {
	PersonId,
	ScheduleEntry,
	ScheduleSlot as ScheduleSlotType,
} from "./types";

interface ScheduleProps {
	slots: ScheduleSlotType[];
	onEntryPress?: (entry: ScheduleEntry) => void;
	/** Show the color legend at the bottom. Defaults to true. */
	showLegend?: boolean;
	/** Restrict / order the people shown in the legend. */
	legendPeople?: PersonId[];
	gutterClassName?: string;
}

/**
 * The schedule body (time slots + optional legend).
 * Intentionally does NOT render the header — compose <ScheduleHeader /> above
 * this so the header can be reused independently across screens.
 */
export function Schedule({
	slots,
	onEntryPress,
	showLegend = true,
	legendPeople,
	gutterClassName = "w-16",
}: ScheduleProps) {
	return (
		<div>
			{slots.map((slot, index) => (
				<Fragment key={slot.id}>
					<ScheduleSlot
						slot={slot}
						onEntryPress={onEntryPress}
						gutterClassName={gutterClassName}
					/>
					{index < slots.length - 1 ? (
						<Separator className="mx-4" />
					) : null}
				</Fragment>
			))}

			{showLegend ? <ScheduleLegend people={legendPeople} /> : null}
		</div>
	);
}
