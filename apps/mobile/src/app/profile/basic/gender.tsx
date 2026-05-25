import { View } from "react-native";

import { SettingsHeader } from "@/components/settings-header";
import { Field } from "@/components/ui/field";
import SelectSheet from "@/components/ui/select-sheet";

export default function BasicProfileGender() {
	return (
		<View className="flex-1 gap-5 px-4 text-foreground pt-6">
			<SettingsHeader
				title="Gênero"
				description="Este é o gênero com o qual você se identifica."
			/>

			<Field label="Gênero">
				<SelectSheet />
			</Field>
		</View>
	);
}
