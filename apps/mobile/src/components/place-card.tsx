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
	size?: "default" | "accessibility";
	onPress?: () => void;
	children?: React.ReactNode;
}

export const PlaceCard = ({
	title,
	description,
	icon = { as: MapPin },
	variant = "bordered",
	className,
	size = "default",
	onPress,
	children,
}: PlaceCardProps) => {
	const {
		as: IconComponent = MapPin,
		className: iconClassName,
		label,
		color,
	} = icon;

	const isAccessibility = size === "accessibility";

	return (
		<Pressable
			onPress={onPress}
			accessibilityLabel={`${title}: ${description}`}
			accessibilityHint="Duplo toque para ver detalhes"
			accessibilityRole="button"
			className={cn(
				"bg-card rounded-lg flex-row items-center justify-between active:opacity-70",
				isAccessibility ? "p-5 gap-5" : "p-3 gap-4",
				variant === "bordered" && "border border-border",
				className,
			)}
		>
			<View
				className={cn(
					"flex-1 flex-row items-center justify-start",
					isAccessibility ? "gap-5" : "gap-4",
				)}
			>
				<View
					className={cn(
						"items-center justify-center",
						isAccessibility ? "gap-1.5" : "gap-1",
						iconClassName,
						variant === "bordered" &&
							cn(
								"rounded-md bg-primary",
								isAccessibility ? "p-3" : "p-2",
							),
					)}
				>
					<Icon
						icon={IconComponent}
						color={color ?? "white"}
						size={isAccessibility ? 28 : 18}
					/>
					{label && (
						<Text
							className={cn(
								isAccessibility ? "text-sm" : "text-xs",
							)}
							numberOfLines={1}
						>
							{label}
						</Text>
					)}
				</View>
				<View className="flex-1">
					<Text
						className={cn(
							"font-bold",
							isAccessibility ? "text-xl" : "text-base",
						)}
						numberOfLines={1}
					>
						{title}
					</Text>
					<Text
						className={cn(
							isAccessibility ? "text-sm mt-1" : "text-xs mt-0.5",
						)}
						numberOfLines={1}
					>
						{description}
					</Text>
				</View>
			</View>
			{children}
		</Pressable>
	);
};
