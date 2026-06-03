import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { cn } from "@/lib/utils";

interface Props {
	title: string;
	label: string;
	variant?: "default" | "destructive";
	href?: string;
	className?: string;
	onPress?: () => void;
	children?: React.ReactNode;
	disabled?: boolean;
}

export function SettingsButton({
	title,
	label,
	variant,
	className,
	href,
	children,
	onPress,
	disabled,
}: Props) {
	const router = useRouter();

	return (
		<Pressable
			android_ripple={href ? { color: "rgba(0, 0, 0, 0.25)" } : undefined}
			className={cn(
				"flex flex-row items-center justify-between p-6 border-b border-border active:bg-primary/50 transition-colors android:active:bg-transparent w-full gap-6",
				{
					"web:active:bg-destructive/15": variant === "destructive",
					"opacity-50": disabled,
				},
				className,
			)}
			onPress={() => {
				if (disabled) return;

				if (href) {
					router.push(href);
				}
				if (onPress) {
					onPress();
				}
			}}
		>
			<View className="flex flex-col items-start justify-center flex-1">
				<Text
					className={cn("font-semibold", {
						"text-destructive": variant === "destructive",
					})}
				>
					{title}
				</Text>
				<Text
					className={cn("text-muted-foreground", {
						"text-destructive": variant === "destructive",
					})}
				>
					{label}
				</Text>
			</View>
			{children ? (
				children
			) : (
				<Icon icon={ChevronRight} size={24} color="--foreground" />
			)}
		</Pressable>
	);
}
