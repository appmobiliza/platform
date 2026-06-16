import { NativeTabs } from "expo-router/unstable-native-tabs";

import { useUserRole } from "@/lib/auth/store";
import { SCHOLAR_THEME, THEME } from "@/lib/theme";
import { useAppColorScheme } from "@/lib/theme/use-app-color-scheme";

import { TAB_DEFINITIONS } from "./app-tabs.config";

export default function AppTabs() {
	const colorScheme = useAppColorScheme();
	const role = useUserRole();

	const isScholar = role === "scholar";
	const theme = isScholar ? SCHOLAR_THEME[colorScheme] : THEME[colorScheme];

	const bgColor = THEME[colorScheme].background;
	const { bar } = theme;

	const visibleTabs = TAB_DEFINITIONS.filter(
		(tab) => !tab.scholarOnly || isScholar,
	);

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
			{visibleTabs.map((tab) => (
				<NativeTabs.Trigger
					key={tab.name}
					name={tab.name}
					contentStyle={{ backgroundColor: bgColor }}
				>
					<NativeTabs.Trigger.Label>
						{tab.label}
					</NativeTabs.Trigger.Label>
					<NativeTabs.Trigger.Icon
						sf={tab.nativeIcon.sf}
						md={tab.nativeIcon.md}
					/>
				</NativeTabs.Trigger>
			))}
		</NativeTabs>
	);
}
