import { useRouter } from "expo-router";
import { ArrowLeftToLine } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

interface HeaderProps {
	title: string;
	description?: string;
}

export function Header({ title, description }: HeaderProps) {
	const router = useRouter();

	return (
		<View className="gap-4 pt-12">
			<TouchableOpacity
				className="text-foreground"
				onPress={() => router.back()}
			>
				<Icon icon={ArrowLeftToLine} size={32} color="foreground" />
			</TouchableOpacity>
			<View className="gap-1">
				<Text className="text-4xl font-semibold">{title}</Text>
				{description ? <Text>{description}</Text> : null}
			</View>
		</View>
	);
}
