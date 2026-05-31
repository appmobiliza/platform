import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

import { THEME } from "@/lib/theme";

import { HEADER_CONFIG } from "../_layout";

export default function AcademicProfileLayout() {
	const colorScheme = useColorScheme();

	return (
		<Stack
			screenOptions={{
				contentStyle: {
					backgroundColor: THEME[colorScheme].background,
				},
			}}
		>
			<Stack.Screen
				name="index"
				options={{ headerTitle: "Acadêmico", ...HEADER_CONFIG() }}
			/>
			{/* <Stack.Screen
				name="course"
				options={{
					headerShown: false,
				}}
			/> */}
		</Stack>
	);
}
