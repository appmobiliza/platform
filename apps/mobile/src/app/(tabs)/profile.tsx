import { Image } from "expo-image";
import { Link } from "expo-router";
import {
	CircleUserRound,
	GraduationCap,
	PersonStanding,
	Settings,
	Star,
} from "lucide-react-native";
import { FlatList, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { cn } from "@/lib/utils";

const options = [
	{
		title: "Dados Pessoais",
		description:
			"Atualize suas informações pessoais, como nome, email e telefone.",
		icon: CircleUserRound,
		href: "/profile/basic",
	},
	{
		title: "Acadêmico",
		description:
			"Atualize suas informações acadêmicas, como curso, período e notas.",
		icon: GraduationCap,
		href: "/profile/academic",
	},
	{
		title: "Locais Salvos",
		description: "Atualize suas informações de locais salvos.",
		icon: Star,
		href: "/profile/saved-locations",
	},
	{
		title: "Acessibilidade",
		description: "Atualize suas informações de acessibilidade.",
		icon: PersonStanding,
		href: "/profile/accessibility",
	},
	{
		title: "Configurações",
		description: "Atualize suas configurações de conta e preferências.",
		icon: Settings,
		href: "/profile/settings",
	},
];

export default function Profile() {
	const insets = useSafeAreaInsets();

	return (
		<View className="flex-1 items-center justify-start">
			<FlatList
				className="w-full"
				data={options}
				keyExtractor={(item) => item.title}
				ListHeaderComponent={
					<View
						className="bg-primary pb-16 px-4 flex justify-center items-center w-full"
						style={{
							paddingTop: insets.top + 64,
						}}
					>
						<Image
							source={{ uri: "https://i.pravatar.cc/300" }}
							style={{
								width: 96,
								height: 96,
								borderRadius: 48,
								marginBottom: 16,
								borderWidth: 2,
								borderColor: "white",
							}}
							contentFit="cover"
							contentPosition="center"
						/>
						<Text className="font-bold text-2xl text-primary-foreground">
							Fulano da Silva
						</Text>
						<Text className="font-normal text-lg text-primary-foreground">
							als@ic.ufal.br
						</Text>
					</View>
				}
				renderItem={({ item, index }) => (
					<Link href={item.href} asChild>
						<Pressable
							android_ripple={{ color: "rgba(0, 0, 0, 0.1)" }}
							className={cn(
								"w-full flex-row items-center justify-center px-8 py-6 border-border active:bg-accent/50 transition-colors",
								{
									"border-b": index < options.length - 1,
								},
							)}
						>
							<View className="w-16 h-16 rounded-full flex items-center justify-center text-foreground">
								<Icon
									icon={item.icon}
									size={32}
									color="foreground"
								/>
							</View>
							<View className="ml-4 flex-1">
								<Text className="font-medium text-lg">
									{item.title}
								</Text>
								<Text className="text-sm text-muted-foreground">
									{item.description}
								</Text>
							</View>
						</Pressable>
					</Link>
				)}
			/>
		</View>
	);
}
