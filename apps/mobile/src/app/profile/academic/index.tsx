import { View } from "react-native";

import { SettingsButton } from "@/components/settings-button";

export default function AcademicProfile() {
	return (
		<View>
			<SettingsButton
				title="Curso"
				label="Pedagogia"
				href="/profile/academic/course"
			/>
			<SettingsButton
				title="Turno"
				label="Integral"
				href="/profile/academic/shift"
			/>
			<SettingsButton
				title="Campus"
				label="A.C Simões"
				href="/profile/academic/campus"
			/>
			<SettingsButton
				title="Matrícula"
				label="234712732"
				className="border-none"
				href="/profile/academic/enrollment"
			/>
		</View>
	);
}
