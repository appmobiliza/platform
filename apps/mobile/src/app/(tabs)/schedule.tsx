import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
	Schedule,
	type ScheduleDay,
	ScheduleHeader,
	type ScheduleSlotType,
} from "@/components/schedule";
import { ScholarHeader } from "@/components/scholar/scholar-header";

/**
 * Example screen wiring the reusable <ScheduleHeader /> together with the
 * <Schedule /> body. Copy this into your RN app and replace the sample data.
 */

const DAYS: ScheduleDay[] = [
	{ weekday: "SEG", day: "30" },
	{ weekday: "TER", day: "31" },
	{ weekday: "QUA", day: "01" },
	{ weekday: "QUI", day: "02" },
	{ weekday: "SEX", day: "03" },
];

const SLOTS: ScheduleSlotType[] = [
	{
		id: "07-12h",
		label: "07-12h",
		cells: [
			[
				{ person: "miguel", time: "07-12h" },
				{ person: "paula", time: "07-12h" },
				null,
				null,
				{ person: "carlos", time: "07-12h" },
			],
			[
				null,
				{ person: "ediluze", time: "07-12h" },
				{ person: "amanda", time: "07-12h" },
				{ person: "carlos", time: "07-12h" },
				{ person: "ediluze", time: "07-12h" },
			],
		],
	},
	{
		id: "12-17h",
		label: "12-17h",
		cells: [
			[
				{ person: "amanda", time: "12-17h" },
				{ person: "miguel", time: "12-17h" },
				{ person: "eduarda", time: "12-17h" },
				null,
				{ person: "paula", time: "12-17h" },
			],
			[
				{ person: "eduarda", time: "12-17h" },
				null,
				{ person: "janderson", time: "12-17h" },
				{ person: "eduarda", time: "12-17h" },
				{ person: "amanda", time: "12-17h" },
			],
		],
	},
	{
		id: "17-22h",
		label: "17-22h",
		cells: [
			[
				{ person: "janderson", time: "17-22h" },
				{ person: "paula", time: "17-22h" },
				null,
				{ person: "miguel", time: "17-22h" },
				null,
			],
			[
				{ person: "janderson", time: "17-22h" },
				{ person: "ediluze", time: "17-22h" },
				null,
				{ person: "carlos", time: "17-22h" },
				null,
			],
		],
	},
];

export default function ScheduleScreen() {
	return (
		<SafeAreaView className="flex-1" edges={["top"]}>
			<ScholarHeader
				scholarName="Bolsista"
				shiftState="not_in_shift"
				currentShiftInfo={null}
			/>
			<ScheduleHeader days={DAYS} />

			<ScrollView showsVerticalScrollIndicator={false}>
				<Schedule
					slots={SLOTS}
					onEntryPress={(entry) => {
						console.log("[v0] entry pressed:", entry);
					}}
				/>
				<View className="h-6" />
			</ScrollView>
		</SafeAreaView>
	);
}
