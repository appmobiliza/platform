import { useRouter } from "expo-router";
import { ArrowLeftToLine } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { cn } from "@/lib/utils";

interface HeaderProps {
	title?: string;
	description?: string;
	size?: "default" | "small";
	allowBack?: boolean;
}

export function Header({
	allowBack = true,
	title,
	description,
	size = "default",
}: HeaderProps) {
	const router = useRouter();

	return (
		<View className="gap-4 pt-12 px-4">
			{allowBack && (
				<TouchableOpacity onPress={() => router.back()}>
					<Icon
						icon={ArrowLeftToLine}
						size={32}
						color="--foreground"
					/>
				</TouchableOpacity>
			)}
			<View className="gap-1">
				{title ? (
					<Text
						className={cn(
							"text-4xl font-semibold",
							size === "small" && "text-2xl font-bold",
						)}
					>
						{title}
					</Text>
				) : null}
				{description ? <Text>{description}</Text> : null}
			</View>
		</View>
	);
}
