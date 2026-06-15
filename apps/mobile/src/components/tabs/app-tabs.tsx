import { NativeTabs } from "expo-router/unstable-native-tabs";

import { useUserRole } from "@/lib/auth/store";
import { SCHOLAR_THEME, THEME } from "@/lib/theme";
import { useAppColorScheme } from "@/lib/theme/use-app-color-scheme";

export default function AppTabs() {
	const colorScheme = useAppColorScheme();
	const role = useUserRole();

	const isScholar = role === "scholar";
	const theme = isScholar ? SCHOLAR_THEME[colorScheme] : THEME[colorScheme];

	const bgColor = THEME[colorScheme].background;
	const { bar } = theme;

	return (
		<NativeTabs
			backgroundColor={bar.background}
			indicatorColor={bar.indicator}
			iconColor={{
				default: bar.icon.default,
				selected: bar.icon.selected,
			}}
			rippleColor={bar.ripple}
			labelStyle={{
				default: {
					color: bar.label.default,
					fontWeight: "bold",
				},
				selected: {
					color: bar.label.selected,
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
