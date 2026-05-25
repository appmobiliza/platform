import { View } from "react-native";

import { StatusMessage } from "@/components/status-message";

export default function NotFound() {
	return (
		<View className="flex-1 items-center justify-center px-6">
			<StatusMessage
				title="Ops! Página não encontrada."
				description="A página que você está procurando não existe ou foi movida."
				button={{ label: "Voltar para o início", href: "/" }}
			/>
		</View>
	);
}
