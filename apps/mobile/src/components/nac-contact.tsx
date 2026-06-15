import { Linking, Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { toast } from "@/components/ui/toast";

interface NacContactProps {
	/** Class name applied to the outer wrapper View */
	className?: string;
	/** Class name for the "Precisando de ajuda?" label — defaults to "text-neutral-400" */
	helpTextClassName?: string;
}

function handleOpenURL(url: string) {
	Linking.openURL(url).catch((err) => {
		console.error("[NacContact] Failed to open URL:", url, err);
	});
}

function NacContactContent() {
	return (
		<View className="gap-3">
			<Pressable
				onPress={() =>
					handleOpenURL("mailto:atendimentonac.ufal@gmail.com")
				}
				className="active:opacity-70"
			>
				<Text className="text-muted-foreground text-sm">E-mail: </Text>
				<Text className="text-info text-sm underline">
					atendimentonac.ufal@gmail.com
				</Text>
			</Pressable>
			<View>
				<Text className="text-muted-foreground text-sm">
					Telefones:
				</Text>
				<View className="flex-row flex-wrap items-center">
					<Pressable
						onPress={() => handleOpenURL("tel:8232141080")}
						className="active:opacity-70"
					>
						<Text className="text-info text-sm underline">
							82 3214-1080
						</Text>
					</Pressable>
					<Text className="text-muted-foreground text-sm"> / </Text>
					<Pressable
						onPress={() => handleOpenURL("tel:8232141081")}
						className="active:opacity-70"
					>
						<Text className="text-info text-sm underline">
							3214-1081
						</Text>
					</Pressable>
					<Text className="text-muted-foreground text-sm"> / </Text>
					<Pressable
						onPress={() => handleOpenURL("tel:8232141079")}
						className="active:opacity-70"
					>
						<Text className="text-info text-sm underline">
							3214-1079
						</Text>
					</Pressable>
				</View>
			</View>
			<Pressable
				onPress={() =>
					handleOpenURL("https://instagram.com/proestufal")
				}
				className="active:opacity-70"
			>
				<Text className="text-muted-foreground text-sm">
					Instagram:{" "}
				</Text>
				<Text className="text-info text-sm underline">@proestufal</Text>
			</Pressable>
		</View>
	);
}

function showNacContactToast() {
	toast.info("Entre em contato com o NAC", {
		description: <NacContactContent />,
	});
}

function NacContact({ className, helpTextClassName }: NacContactProps) {
	return (
		<View className={className}>
			<Text
				className={`text-sm ${helpTextClassName ?? "text-neutral-400"}`}
			>
				Precisando de ajuda?
			</Text>
			<Pressable className="mt-1" onPress={showNacContactToast}>
				<Text className="text-sm text-muted-foreground underline font-medium">
					Entre em contato com o NAC
				</Text>
			</Pressable>
		</View>
	);
}

export { NacContact, NacContactContent, showNacContactToast };
