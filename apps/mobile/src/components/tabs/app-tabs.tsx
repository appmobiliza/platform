import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useColorScheme } from "react-native";

import { THEME } from "@/lib/theme";
import { useUserRole } from "@/lib/auth-store";

export default function AppTabs() {
	const colorScheme = useColorScheme();
	const role = useUserRole();
	
	const bgColor =
		colorScheme === "dark" ? THEME.dark.background : THEME.light.background;

	// Scholar Specific Overrides
	const isScholar = role === "scholar";

	const barColor = isScholar 
		? "#1A1F1F" // Dark background for scholar tab bar
		: (colorScheme === "dark" ? THEME.dark.bar.background : THEME.light.bar.background);

	const labelColor = isScholar
		? { default: "#A3A3A3", selected: "#60A5FA" } // Gray default, light blue selected
		: (colorScheme === "dark" ? THEME.dark.bar.label : THEME.light.bar.label);

	const indicatorColor = isScholar
		? "#0A2540" // Deep blue indicator
		: (colorScheme === "dark" ? THEME.dark.bar.indicator : THEME.light.bar.indicator);

	const iconColor = isScholar
		? { default: "#A3A3A3", selected: "#FFFFFF" } // Gray default, white inside indicator
		: (colorScheme === "dark" ? THEME.dark.bar.icon : THEME.light.bar.icon);

	const rippleColor = isScholar
		? "rgba(255, 255, 255, 0.1)"
		: (colorScheme === "dark" ? THEME.dark.bar.ripple : THEME.light.bar.ripple);

	return (
		<NativeTabs
			backgroundColor={barColor}
			indicatorColor={indicatorColor}
			iconColor={{
				default: iconColor.default,
				selected: iconColor.selected,
			}}
			rippleColor={rippleColor}
			labelStyle={{
				default: {
					color: labelColor.default,
					fontWeight: "bold",
				},
				selected: {
					color: labelColor.selected,
					fontWeight: "bold",
				},
			}}
		>
			<NativeTabs.Trigger
				name="index"
				contentStyle={{ backgroundColor: bgColor }}
			>
				<NativeTabs.Trigger.Label>Início</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon
					sf={{ default: "house", selected: "house.fill" }}
					md={{ default: "home", selected: "home_filled" }}
				/>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger
				name="history"
				contentStyle={{ backgroundColor: bgColor }}
			>
				<NativeTabs.Trigger.Icon
					sf="map"
					md={{ default: "map", selected: "map" }}
				/>
				<NativeTabs.Trigger.Label>Histórico</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger
				name="profile"
				contentStyle={{ backgroundColor: bgColor }}
			>
				<NativeTabs.Trigger.Icon
					sf="person"
					md={{
						default: "account_circle",
						selected: "account_circle",
					}}
				/>
				<NativeTabs.Trigger.Label>Perfil</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}
