import { Clock, MapPin, Star } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { cn } from "@/lib/utils";

interface PlaceCardProps {
	title: string;
	subtitle: string;
	icon: {
		name: "clock" | "star" | "map";
		className?: string;
		label?: string;
	};
	className?: string;
	onPress?: () => void;
}

export const PlaceCard = ({
	title,
	subtitle,
	icon,
	className,
	onPress,
}: PlaceCardProps) => {
	const { name, className: iconClassName, label } = icon;
	const iconComponent =
		name === "clock" ? Clock : name === "star" ? Star : MapPin;

	return (
		<TouchableOpacity
			activeOpacity={0.7}
			onPress={onPress}
			accessibilityLabel={`${title}: ${subtitle}`}
			accessibilityHint="Duplo toque para ver detalhes"
			accessibilityRole="button"
			className={cn(
				"bg-card rounded-lg p-3 border border-border flex-row items-center gap-4",
				className,
			)}
		>
			<View
				className={cn(
					"p-2 rounded-md bg-primary items-center w-12 justify-center gap-1",
					iconClassName,
				)}
			>
				<Icon icon={iconComponent} size={18} color="--foreground" />
				{label && (
					<Text className="text-xs" numberOfLines={1}>
						{label}
					</Text>
				)}
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
