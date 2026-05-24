import type { View } from "react-native";

import { useUnstableNativeVariable } from "@/lib/theme";

interface IconProps {
	icon: React.ComponentType<{ size?: number; color?: string }>;
	size?: number;
	color?: string;
	style?: React.ComponentProps<typeof View>["style"];
}

export function Icon({
	icon: IconComponent,
	color = "currentColor",
	...props
}: IconProps) {
	const themeColor = useUnstableNativeVariable(color) || color;
	return <IconComponent color={themeColor} {...props} />;
}
