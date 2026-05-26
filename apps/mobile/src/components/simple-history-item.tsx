import { Link } from "expo-router";
import { Clock } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";

import { cn } from "@/lib/utils";

interface SimpleHistoryItemProps {
	className?: string;
	title: string;
	subtitle: string;
	href: string;
}

export const SimpleHistoryItem = ({
	className,
	title,
	subtitle,
	href,
}: SimpleHistoryItemProps) => {
	return (
		<Link
			asChild
			href={href}
			accessibilityRole="button"
			accessibilityLabel={title}
			accessibilityHint="Duplo toque para ver detalhes"
		>
			<Pressable
				android_ripple={{ color: "rgba(0, 0, 0, 0.25)" }}
				className={cn(
					"flex-row items-center py-4 px-6 gap-4 border-border flex-1 active:bg-accent/50 android:active:bg-transparent transition-colors",
					className,
				)}
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
				{/* <Button variant={"secondary"} className="rounded-full">
				<RotateCcw size={16} className="text-secondary-foreground" />
				<Text className="font-medium">Reagendar</Text>
			</Button> */}
			</Pressable>
		</Link>
	);
};
