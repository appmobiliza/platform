import { useRouter } from "expo-router";
import { ArrowLeftToLine } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";

import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

export default function BasicProfileName() {
	const router = useRouter();

	return (
		<View className="flex-1 gap-5 px-4 text-foreground pt-6">
			<TouchableOpacity onPress={() => router.back()}>
				<Icon icon={ArrowLeftToLine} size={24} color="foreground" />
			</TouchableOpacity>
			<View className="gap-1">
				<Text className="text-4xl font-semibold">Nome</Text>
				<Text className="">
					Este é o nome que você quer que outras pessoas usem quando
					se referirem a você
				</Text>
			</View>

			<Field label="Nome">
				<Input placeholder="Fulano" />
			</Field>

			<Field label="Sobrenome">
				<Input placeholder="da Silva" />
			</Field>
		</View>
	);
}
