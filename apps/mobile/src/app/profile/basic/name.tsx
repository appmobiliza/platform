import { View } from "react-native";

import { SettingsHeader } from "@/components/settings-header";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function BasicProfileName() {
	return (
		<View className="flex-1 gap-5 px-4 text-foreground pt-6">
			<SettingsHeader
				title="Nome"
				description="Este é o nome que você quer que outras pessoas usem quando se referirem a você"
			/>

			<Field label="Nome">
				<Input placeholder="Fulano" />
			</Field>

			<Field label="Sobrenome">
				<Input placeholder="da Silva" />
			</Field>
		</View>
	);
}
