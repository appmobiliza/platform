import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Logo } from "../components/ui/Logo";

export default function Splash() {
	const router = useRouter();

	useEffect(() => {
		const timer = setTimeout(() => {
			router.replace("/login");
		}, 2500);

		return () => clearTimeout(timer);
	}, [router]);

	return (
		<Animated.View
			entering={FadeIn.duration(500)}
			exiting={FadeOut.duration(500)}
			className="flex-1 items-center justify-center bg-brand-primary"
		>
			<Logo light />
		</Animated.View>
	);
}
