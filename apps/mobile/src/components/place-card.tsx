import { MapPin } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { cn } from "@/lib/utils";

interface PlaceCardProps {
	title: string;
	description: string;
	icon?: {
		as: React.ComponentType<{ size?: number; color?: string }>;
		className?: string;
		label?: string;
		color?: string;
	};
	variant?: "default" | "bordered";
	className?: string;
	onPress?: () => void;
	children?: React.ReactNode;
}

export const PlaceCard = ({
	title,
	description,
	icon = { as: MapPin },
	variant = "bordered",
	className,
	onPress,
	children,
}: PlaceCardProps) => {
	const {
		as: IconComponent = MapPin,
		className: iconClassName,
		label,
		color,
	} = icon;

	return (
		<Pressable
			onPress={onPress}
			accessibilityLabel={`${title}: ${description}`}
			accessibilityHint="Duplo toque para ver detalhes"
			accessibilityRole="button"
			className={cn(
				"bg-card rounded-lg p-3 flex-row items-center justify-between gap-4 active:opacity-70",
				variant === "bordered" && "border border-border",
				className,
			)}
		>
			<View className="flex-1 gap-4 flex-row items-center justify-start">
				<View
					className={cn(
						"items-center justify-center gap-1",
						iconClassName,
						variant === "bordered" && "p-2 rounded-md bg-primary",
					)}
				>
					<Icon
						icon={IconComponent}
						color={color ?? "white"}
						size={18}
					/>
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
						{description}
					</Text>
				</View>
			</View>
			{children}
		</Pressable>
	);
};
