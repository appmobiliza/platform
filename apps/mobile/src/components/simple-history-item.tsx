import { Clock, RotateCcw } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

interface SimpleHistoryItemProps {
	title: string;
	subtitle: string;
	onPress: () => void;
}

export const SimpleHistoryItem = ({
	title,
	subtitle,
	onPress,
}: SimpleHistoryItemProps) => {
	return (
		<TouchableOpacity
			activeOpacity={0.7}
			onPress={onPress}
			className="flex-row items-center py-4 gap-4 border-b border-border"
		>
			<View className="bg-primary w-14 h-14 rounded-lg items-center justify-center shadow-sm">
				<Clock size={20} color="white" />
			</View>
			<View className="flex-1">
				<Text
					className="text-foreground font-bold text-base"
					numberOfLines={2}
				>
					{title}
				</Text>
				<Text className="text-muted-foreground text-xs mt-0.5">
					{subtitle}
				</Text>
			</View>
			<Button variant={"secondary"} className="rounded-full">
				<RotateCcw size={16} className="text-secondary-foreground" />
				<Text className="font-medium">Reagendar</Text>
			</Button>
		</TouchableOpacity>
	);
};
