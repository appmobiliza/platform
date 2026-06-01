import { Link } from "expo-router";
import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

interface Props {
	title: string;
	description?: string;
	icon?: React.ReactNode;
	button?: {
		label: string;
		href: string;
	};
}

export function StatusMessage({ title, description, icon, button }: Props) {
	return (
		<View className="flex-1 items-center justify-center px-6">
			{icon && <View className="mb-4">{icon}</View>}
			<Text className="text-2xl font-bold text-center">{title}</Text>
			{description && (
				<Text className="text-center text-muted-foreground mt-2">
					{description}
				</Text>
			)}
			{button && (
				<Link href={button.href} asChild>
					<Button className="mt-6">
						<Text>{button.label}</Text>
					</Button>
				</Link>
			)}
		</View>
	);
}
