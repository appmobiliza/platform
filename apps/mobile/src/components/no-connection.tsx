import { WifiOff } from "lucide-react-native";
import { Linking, Pressable, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

export function NoConnection() {
	return (
		<View className="w-full border border-border p-4 rounded-lg justify-center flex-row items-start gap-4">
			<View className="mt-0.5">
				<Icon icon={WifiOff} size={20} color="--foreground" />
			</View>

			<View className="flex-1 flex-col gap-1">
				<Text className="font-medium">
					Você está sem conexão com a internet
				</Text>
				<Text className="text-sm text-muted-foreground">
					Para solicitar um deslocamento offline, entre em contato com
					o NAC via telefone em: {"\n"}
					<Pressable
						onPress={() => Linking.openURL("tel:82982311823")}
					>
						<Text className="font-extrabold active:underline active:opacity-80">
							(82) 98231-1823
						</Text>
					</Pressable>
				</Text>
			</View>
		</View>
	);
}
