import { View } from "react-native";

import { Header } from "@/components/header";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function BasicProfileEmail() {
	return (
		<View className="flex-1 gap-5 px-4 text-foreground pt-6">
			<Header
				title="E-mail"
				description="Este é seu endereço de e-mail principal, usado para contato e recuperação de conta."
			/>

			<Field label="E-mail">
				<Input placeholder="seu.email@exemplo.com" />
			</Field>
		</View>
	);
}
