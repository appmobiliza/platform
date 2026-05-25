import { View } from "react-native";

import { Header } from "@/components/header";
import { Field } from "@/components/ui/field";
import { MaskedInput } from "@/components/ui/masked-input";

export default function BasicProfileCpf() {
	return (
		<View className="flex-1 gap-5 px-4 text-foreground pt-6">
			<Header
				title="Número do CPF"
				description="Este é seu número de CPF, usado para identificação e registro."
			/>

			<Field label="CPF">
				<MaskedInput mask="cpf" placeholder="000.000.000-00" />
			</Field>
		</View>
	);
}
