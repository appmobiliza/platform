import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Pressable, View } from "react-native";

import MapView from "@/components/map/map-view";
import { RequestFlowSheet } from "@/components/request-flow-sheet";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

const scholar = {
	latitude: -9.636,
	longitude: -35.712,
};

export default function RequestScreen() {
	const router = useRouter();

	return (
		<View className="flex-1 bg-background overflow-hidden">
			<MapView scholar={scholar} />
			<View className="relative z-10 flex-row items-start gap-4 px-4 pt-4">
				<Pressable
					className="shrink-0 p-3 bg-secondary text-foreground rounded-full shadow-sm shadow-secondary/20 mt-4"
					onPress={() => router.back()}
				>
					<Icon icon={ArrowLeft} size={24} color="foreground" />
				</Pressable>
				<View className="min-w-0 flex-1 gap-1 items-start justify-start">
					<Text
						variant={"h1"}
						className="text-foreground text-left"
						numberOfLines={1}
					>
						Campus A.C Simões
					</Text>
					<Text
						className="text-foreground text-left"
						numberOfLines={1}
					>
						29 de abril ⋅ Turno Matutino
					</Text>
				</View>
			</View>
			<RequestFlowSheet />
		</View>
	);
}
