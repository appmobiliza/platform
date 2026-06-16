import { useMemo } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
	Schedule,
	ScheduleHeader,
	type ScheduleSlotType,
} from "@/components/schedule";
import {
	getCurrentWeekDays,
	transformSchedulesToSlots,
} from "@/components/schedule/schedule-data";
import { ScholarHeader } from "@/components/scholar/scholar-header";

import { useUser } from "@/lib/auth/store";
import { trpc } from "@/lib/trpc/client";

export default function ScheduleScreen() {
	const { data: schedules, isLoading } = trpc.profiles.getSchedules.useQuery(
		undefined,
		{
			staleTime: 5 * 60 * 1000,
			gcTime: 30 * 60 * 1000,
		},
	);

	const user = useUser();
	const scholarName = user.name?.split(" ")[0] ?? "Bolsista";

	const days = useMemo(() => getCurrentWeekDays(), []);

	const slots: ScheduleSlotType[] = useMemo(
		() => (schedules ? transformSchedulesToSlots(schedules) : []),
		[schedules],
	);

	return (
		<SafeAreaView className="flex-1" edges={["top"]}>
			<ScholarHeader
				scholarName={scholarName}
				shiftState="not_in_shift"
				currentShiftInfo={null}
			/>
			<ScheduleHeader days={days} />

			<ScrollView showsVerticalScrollIndicator={false}>
				{isLoading ? (
					<View className="flex-1 items-center justify-center py-20">
						<ActivityIndicator size="large" />
						<Text className="mt-4 text-muted-foreground">
							Carregando escala...
						</Text>
					</View>
				) : slots.length > 0 ? (
					<Schedule
						slots={slots}
						onEntryPress={(entry) => {
							console.log("[schedule] entry pressed:", entry);
						}}
					/>
				) : (
					<View className="flex-1 items-center justify-center py-20 px-4">
						<Text className="text-center text-base text-muted-foreground">
							Nenhum bolsista com escala cadastrada para esta
							semana.
						</Text>
					</View>
				)}
				<View className="h-6" />
			</ScrollView>
		</SafeAreaView>
	);
}
