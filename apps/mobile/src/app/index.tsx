import { useEffect } from "react";

import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { Logo } from "@/assets/logo";

export default function Splash() {
	const router = useRouter();

	useEffect(() => {
		const timer = setTimeout(() => {
			router.replace("/auth");
		}, 2500);

		return () => clearTimeout(timer);
	}, [router]);

	return (
		<Animated.View
			entering={FadeIn.duration(500)}
			exiting={FadeOut.duration(500)}
			className="flex-1 items-center justify-center bg-primary"
		>
			<Logo />
		</Animated.View>
	);
}
