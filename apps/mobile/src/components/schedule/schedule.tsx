import { Fragment, useMemo } from "react";
import { View } from "react-native";

import { buildColorMap } from "./colors";
import { ScheduleLegend } from "./schedule-legend";
import { ScheduleSlot } from "./schedule-slot";
import type { ScheduleEntry, ScheduleSlot as ScheduleSlotType } from "./types";

interface ScheduleProps {
	slots: ScheduleSlotType[];
	onEntryPress?: (entry: ScheduleEntry) => void;
	/** Show the color legend at the bottom. Defaults to true. */
	showLegend?: boolean;
	/** Restrict / order the people shown in the legend. If omitted, derived from slots. */
	legendPeople?: string[];
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
	legendPeople: legendPeopleProp,
	gutterClassName = "w-16",
}: ScheduleProps) {
	/** Derive unique people from the slots when no explicit list is given. */
	const legendPeople = useMemo(() => {
		if (legendPeopleProp) return legendPeopleProp;
		const set = new Set<string>();
		for (const slot of slots) {
			for (const row of slot.cells) {
				for (const entry of row) {
					if (entry) set.add(entry.person);
				}
			}
		}
		return Array.from(set).sort();
	}, [slots, legendPeopleProp]);

	/** Build a deterministic color map so each person gets a unique color. */
	const colorMap = useMemo(() => buildColorMap(legendPeople), [legendPeople]);

	return (
		<View>
			{slots.map((slot, index) => (
				<Fragment key={slot.id}>
					<ScheduleSlot
						slot={slot}
						onEntryPress={onEntryPress}
						gutterClassName={gutterClassName}
						colorMap={colorMap}
					/>
					{index < slots.length - 1 ? (
						<View className="mx-4 h-px bg-border" />
					) : null}
				</Fragment>
			))}

			{showLegend ? (
				<ScheduleLegend people={legendPeople} colorMap={colorMap} />
			) : null}
		</View>
	);
}
