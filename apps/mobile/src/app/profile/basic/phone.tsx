import { View } from "react-native";

import { Header } from "@/components/header";
import { Field } from "@/components/ui/field";
import { MaskedInput } from "@/components/ui/masked-input";

export default function BasicProfilePhone() {
	return (
		<View className="flex-1 gap-5 px-4 text-foreground pt-6">
			<Header
				title="Número de telefone"
				description="Este é seu número de telefone principal, usado para contato e recuperação de conta."
			/>

			<Field label="Telefone">
				<MaskedInput mask="phone" placeholder="(00) 00000-0000" />
			</Field>
		</View>
	);
}
