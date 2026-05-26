import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { RequestFlowSheet } from "@/components/request-flow-sheet";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

export default function RequestScreen() {
	const router = useRouter();

	return (
		<View className="flex-1 bg-background overflow-hidden">
			<Image
				source={require("@/assets/images/map.png")}
				className="absolute inset-0 -z-10"
				contentFit="cover"
				pointerEvents="none"
			/>
			<View className="relative z-10 flex-row items-start gap-4 px-4 pt-4">
				<Pressable
					className="shrink-0 p-3 bg-secondary text-secondary-foreground rounded-full shadow-sm shadow-secondary/20 mt-4"
					onPress={() => router.back()}
				>
					<Icon
						icon={ArrowLeft}
						size={24}
						color="secondary-foreground"
					/>
				</Pressable>
				<View className="min-w-0 flex-1 gap-1 items-start justify-start">
					<Text
						variant={"h1"}
						className="text-secondary-inverted-foreground text-left"
						numberOfLines={1}
					>
						Campus A.C Simões
					</Text>
					<Text
						className="text-secondary-inverted-foreground text-left"
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
