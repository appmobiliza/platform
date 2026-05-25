import { View } from "react-native";

import { SettingsButton } from "@/components/settings-button";

export default function AcademicProfile() {
	return (
		<View>
			<SettingsButton title="Curso" label="Pedagogia" />
			<SettingsButton title="Turno" label="Integral" />
			<SettingsButton title="Campus" label="A.C Simões" />
			<SettingsButton
				title="Matrícula"
				label="234712732"
				className="border-none"
			/>
		</View>
	);
}
