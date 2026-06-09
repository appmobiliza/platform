import { Info } from "lucide-react-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import type { AcessibleRequestStep } from "./types";

/**
 * Shared layout wrapper used by every step.
 * Renders subtitle, title, and a note box at the top (flush with safe area),
 * then the step's children centered in the remaining space.
 */
export function FlowStep({
	title,
	note,
	children,
	subtitle,
}: AcessibleRequestStep) {
	const insets = useSafeAreaInsets();

	return (
		<View className="flex-1">
			{/* Header: flush at the top with safe-area padding */}
			<View
				className="bg-primary px-4 justify-start items-start"
				style={{ paddingTop: insets.top }}
			>
				{subtitle && (
					<Text className="text-primary-foreground font-semibold text-lg mt-4 mb-1">
						{subtitle}
					</Text>
				)}
				<Text
					className="text-primary-foreground text-4xl mb-4 font-extrabold"
					accessibilityRole="header"
				>
					{title}
				</Text>
				<View className="flex flex-row items-center justify-center mb-4 gap-3 w-full bg-background rounded-md p-4">
					<Icon icon={Info} color="white" size={20} />
					<Text className="text-primary-foreground text-base flex-1 leading-6">
						{note}
					</Text>
				</View>
			</View>
			{/* Content: fills remaining space and centers children */}
			<View className="flex-1 justify-center">{children}</View>
		</View>
	);
}
