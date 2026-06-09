import { useEffect } from "react";

import { UserRoundSearch } from "lucide-react-native";
import { View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSequence,
	withTiming,
} from "react-native-reanimated";

export function SearchIndicator() {
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
		<View className="relative size-16 items-center justify-center">
			<View className="absolute size-16 rounded-full bg-primary/50 animate-ping" />

			<Animated.View
				className="size-16 items-center justify-center rounded-full bg-primary"
				// style={animatedStyle}
			>
				<UserRoundSearch size={28} color="white" />
			</Animated.View>
		</View>
	);
}
