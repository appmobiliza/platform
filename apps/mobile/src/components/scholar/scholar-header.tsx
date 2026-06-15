import { Clock } from "lucide-react-native";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Logo } from "@/assets/logo";

import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

export type ShiftState = "not_in_shift" | "shift_not_started" | "shift_active";

export interface CurrentShiftInfo {
	label: string;
	time: string;
}

export interface ScholarHeaderProps {
	scholarName: string;
	shiftState: ShiftState;
	currentShiftInfo: CurrentShiftInfo | null;
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function ShiftPill({ label, time }: { label: string; time: string }) {
	return (
		<View className="flex-row items-center justify-between rounded-lg bg-black/20 px-4 py-3">
			<View className="flex-row items-center">
				<Clock color="#FFFFFF" size={18} />
				<Text className="ml-3 text-base font-medium text-primary-foreground">
					{label}
				</Text>
			</View>
			<Text className="text-base text-primary-foreground">{time}</Text>
		</View>
	);
}

// ─── Main component ─────────────────────────────────────────────────────────

export function ScholarHeader({
	scholarName,
	shiftState,
	currentShiftInfo,
}: ScholarHeaderProps) {
	const insets = useSafeAreaInsets();

	return (
		<View
			className="bg-primary px-4 pb-4 gap-4"
			style={{ paddingTop: insets.top + 24 }}
		>
			<View className="flex-row items-center justify-between">
				<View className="flex-col items-start justify-start">
					<Text className="text-sm font-medium text-primary-foreground mb-2">
						Olá, {scholarName} 👋
					</Text>
					<Logo fill="#FFFFFF" height={28} width={160} />
				</View>

				<Badge
					className={cn("py-1 px-2.5", {
						"bg-green-600": shiftState === "shift_active",
						"bg-yellow-600": shiftState === "shift_not_started",
						"bg-accent": shiftState === "not_in_shift",
					})}
				>
					<View
						className={cn("mr-1 h-1.5 w-1.5 rounded-full", {
							"bg-green-300": shiftState === "shift_active",
							"bg-yellow-300": shiftState === "shift_not_started",
							"bg-red-300": shiftState === "not_in_shift",
						})}
					/>
					<Text className="text-sm font-medium text-white leading-none mb-0.5">
						{shiftState === "shift_active"
							? "Em turno"
							: shiftState === "shift_not_started"
								? "Iniciar turno"
								: "Fora do turno"}
					</Text>
				</Badge>
			</View>

			{currentShiftInfo && (
				<ShiftPill
					label={currentShiftInfo.label}
					time={currentShiftInfo.time}
				/>
			)}
		</View>
	);
}
