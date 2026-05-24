import { Clock, RotateCcw } from "lucide-react-native";
import { Pressable, View } from "react-native";

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
		<View className="flex-row items-center py-4 gap-4 border-b border-border">
			<Pressable
				onPress={onPress}
				accessibilityRole="button"
				accessibilityLabel={title}
				accessibilityHint="Duplo toque para ver detalhes"
				className="flex-row items-center flex-1 gap-4"
			>
				<View className="bg-primary w-14 h-14 rounded-sm items-center justify-center shadow-sm">
					<Clock size={20} color="white" />
				</View>
				<View className="flex-1">
					<Text
						className="text-foreground font-bold text-lg"
						numberOfLines={2}
					>
						{title}
					</Text>
					<Text className="text-muted-foreground text-sm mt-0.5">
						{subtitle}
					</Text>
				</View>
			</Pressable>
			{/* <Button variant={"secondary"} className="rounded-full">
				<RotateCcw size={16} className="text-secondary-foreground" />
				<Text className="font-medium">Reagendar</Text>
			</Button> */}
		</View>
	);
};
