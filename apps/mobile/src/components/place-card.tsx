import { Clock, MapPin, Star } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";

import { Text } from "@/components/ui/text";

import { cn } from "@/utils/cn";

interface PlaceCardProps {
	title: string;
	subtitle: string;
	iconType: "clock" | "star" | "map";
	className?: string;
	onPress?: () => void;
}

export const PlaceCard = ({
	title,
	subtitle,
	iconType,
	className,
	onPress,
}: PlaceCardProps) => {
	const Icon =
		iconType === "clock" ? Clock : iconType === "star" ? Star : MapPin;

	return (
		<TouchableOpacity
			activeOpacity={0.7}
			onPress={onPress}
			accessibilityLabel={`${title}: ${subtitle}`}
			accessibilityHint="Duplo toque para ver detalhes"
			accessibilityRole="button"
			className={cn(
				"bg-card rounded-lg p-3 border border-border flex-row items-center gap-3",
				className,
			)}
		>
			<View className="p-2 rounded-md bg-primary">
				<Icon size={18} color="white" />
			</View>
			<View className="flex-1">
				<Text className="font-bold text-base" numberOfLines={1}>
					{title}
				</Text>
				<Text className="text-xs mt-0.5" numberOfLines={1}>
					{subtitle}
				</Text>
			</View>
		</TouchableOpacity>
	);
};
