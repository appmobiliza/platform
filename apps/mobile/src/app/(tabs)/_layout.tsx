import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useColorScheme } from "react-native";

import { THEME } from "@/lib/theme";

export default function TabsLayout() {
	const colorScheme = useColorScheme();
	const bgColor =
		colorScheme === "dark" ? THEME.dark.background : THEME.light.background;

	const barColor =
		colorScheme === "dark"
			? THEME.dark.bar.background
			: THEME.light.bar.background;
	const labelColor =
		colorScheme === "dark" ? THEME.dark.bar.label : THEME.light.bar.label;
	const indicatorColor =
		colorScheme === "dark"
			? THEME.dark.bar.indicator
			: THEME.light.bar.indicator;
	const iconColor =
		colorScheme === "dark" ? THEME.dark.bar.icon : THEME.light.bar.icon;
	const rippleColor =
		colorScheme === "dark" ? THEME.dark.bar.ripple : THEME.light.bar.ripple;

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
