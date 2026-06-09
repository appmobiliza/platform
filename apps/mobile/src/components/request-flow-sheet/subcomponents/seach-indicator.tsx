import { UserRoundSearch } from "lucide-react-native";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSequence,
	withTiming,
} from "react-native-reanimated";

import { cn } from "@/lib/utils";

interface Props {
	size?: "default" | "lg";
}

export function SearchIndicator({ size = "default" }: Props) {
	// const scale = useSharedValue(1);

	// useEffect(() => {
	// 	scale.value = withRepeat(
	// 		withSequence(
	// 			withTiming(1.08, { duration: 800 }),
	// 			withTiming(1, { duration: 800 }),
	// 		),
	// 		-1,
	// 		true,
	// 	);
	// }, []);

	// const animatedStyle = useAnimatedStyle(() => ({
	// 	transform: [{ scale: scale.value }],
	// }));

	return (
		<View
			className={cn("relative size-16 items-center justify-center", {
				"size-24": size === "lg",
			})}
		>
			<View
				className={cn(
					"absolute size-16 rounded-full bg-primary/50 animate-ping",
					{
						"size-24": size === "lg",
					},
				)}
			/>

			<Animated.View
				className={cn(
					"size-16 items-center justify-center rounded-full bg-primary",
					{
						"size-24": size === "lg",
					},
				)}
				// style={animatedStyle}
			>
				<UserRoundSearch size={size === "lg" ? 36 : 28} color="white" />
			</Animated.View>
		</View>
	);
}
