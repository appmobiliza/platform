import * as React from "react";
import { Platform, Pressable, View } from "react-native";
import {
	FadeIn,
	FadeOut,
	SlideInDown,
	SlideOutDown,
} from "react-native-reanimated";
import { FullWindowOverlay as RNFullWindowOverlay } from "react-native-screens";

import { NativeOnlyAnimatedView } from "@/components/ui/native-only-animated-view";

const FullWindowOverlay =
	Platform.OS === "ios" ? RNFullWindowOverlay : React.Fragment;

/**
 * Root container that renders children inside a FullWindowOverlay on iOS
 * (to appear above modals/navigation) or a Fragment elsewhere.
 */
export function OverlayRoot({ children }: { children: React.ReactNode }) {
	if (Platform.OS === "web") return <>{children}</>;
	return <FullWindowOverlay>{children}</FullWindowOverlay>;
}

interface OverlayBackdropProps {
	visible: boolean;
	onPress?: () => void;
}

/**
 * An animated semi-transparent backdrop.
 *
 * - Native: uses Reanimated FadeIn / FadeOut via conditional rendering
 *   (unmounting triggers the exit animation).
 * - Web: renders a plain Pressable with a black overlay.
 */
export function OverlayBackdrop({ visible, onPress }: OverlayBackdropProps) {
	if (!visible) return null;

	if (Platform.OS === "web") {
		return (
			<Pressable
				onPress={onPress}
				className="absolute bottom-0 left-0 right-0 top-0 bg-black/50"
			/>
		);
	}

	return (
		<Pressable
			onPress={onPress}
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
			}}
		>
			<NativeOnlyAnimatedView
				entering={FadeIn.duration(200)}
				exiting={FadeOut.duration(150)}
				style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
			/>
		</Pressable>
	);
}

interface OverlayCenterProps {
	children: React.ReactNode;
}

/**
 * Full-screen container that centers children both horizontally and
 * vertically. Uses `pointerEvents="box-none"` so touches pass through
 * to a backdrop rendered behind it.
 */
export function OverlayCenter({ children }: OverlayCenterProps) {
	const common = {
		position: "absolute" as const,
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		alignItems: "center" as const,
		justifyContent: "center" as const,
		padding: 8,
	};

	return (
		<View style={common} pointerEvents="box-none">
			{children}
		</View>
	);
}

interface AnimatedSlideContentProps {
	children: React.ReactNode;
	visible: boolean;
}

/**
 * Content wrapper with a slide-from-bottom / slide-out-down animation.
 *
 * On native, uses Reanimated layout animations triggered by conditional
 * rendering. On web, simply renders (or hides) children — consumers
 * should add CSS-based animations via the `leaving` pattern.
 */
export function AnimatedSlideContent({
	children,
	visible,
}: AnimatedSlideContentProps) {
	if (Platform.OS === "web") {
		if (!visible) return null;
		return <>{children}</>;
	}

	if (!visible) return null;

	return (
		<NativeOnlyAnimatedView
			entering={SlideInDown.duration(300).springify()}
			exiting={SlideOutDown.duration(200)}
			style={{ width: "100%", alignItems: "center" }}
		>
			{children}
		</NativeOnlyAnimatedView>
	);
}
