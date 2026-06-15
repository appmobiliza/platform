import { useRouter } from "expo-router";
import { ArrowLeftToLine } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { cn } from "@/lib/utils";

interface HeaderProps {
	title?: string;
	description?: string;
	size?: "default" | "small";
	href?: "back" | string | null;
	onClick?: () => void;
	isDisabled?: boolean;
}

export function Header({
	title,
	description,
	size = "default",
	href = "back",
	onClick,
	isDisabled,
}: HeaderProps) {
	const router = useRouter();

	const showBackButton = Boolean(href !== null || onClick);

	const handlePress = () => {
		if (onClick) {
			onClick();
			return;
		}

		if (!href) {
			return;
		}

		if (href === "back") {
			router.back();
			return;
		}

		router.push(href);
	};

	return (
		<View className="gap-4 px-4 pt-12">
			{showBackButton ? (
				<Pressable onPress={handlePress} disabled={isDisabled}>
					<Icon
						icon={ArrowLeftToLine}
						size={32}
						color="--foreground"
					/>
				</Pressable>
			) : null}

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
