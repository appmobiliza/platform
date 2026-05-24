import type { View } from "react-native";

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
	return <IconComponent {...props} />;
}
