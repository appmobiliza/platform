import { useLocalSearchParams, useRouter } from "expo-router";
import { Clock } from "lucide-react-native";
import { FlatList, Pressable, View } from "react-native";

import { Header } from "@/components/header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";

import { useLightStatusBar } from "@/hooks/use-light-status-bar";
import { cn } from "@/lib/utils";

// Mocking services in the shift
const services = [
	{
		id: "s1",
		title: "CAC - Centro de Artes e Cultura",
		time: "18:00 - 18:23",
		studentName: "João Carlos",
		studentInitials: "JC",
	},
	{
		id: "s2",
		title: "Auditório Principal",
		time: "18:30 - 18:53",
		studentName: "João Carlos",
		studentInitials: "JC",
	},
	{
		id: "s3",
		title: "Sala de Estudo do COS",
		time: "19:00 - 19:23",
		studentName: "Ana Beatriz",
		studentInitials: "AB",
	},
	{
		id: "s4",
		title: "Cafeteria",
		time: "19:30 - 19:53",
		studentName: "Lucas Mendes",
		studentInitials: "LM",
	},
];

export default function ScholarShiftDetails() {
	useLightStatusBar();

	const { id } = useLocalSearchParams();
	const router = useRouter();

	return (
		<View className="flex-1 bg-background">
			<Header title="1 de agosto" />

			<Text className="font-semibold text-xl mt-4 pl-4">
				4 deslocamentos
			</Text>

			<FlatList
				data={services}
				keyExtractor={(item) => item.id}
				renderItem={({ item, index }) => (
					<Pressable
						onPress={() => router.push(`/history/${item.id}`)}
						className={cn(
							"flex-row items-center p-5 gap-4 border-b border-border",
							index === services.length - 1 &&
								"border-transparent",
						)}
					>
						<View className="flex-row items-start flex-1">
							<View className="bg-primary p-4 rounded-sm items-center justify-center mr-4">
								<Clock size={20} color="white" />
							</View>
							<View className="flex-1 mr-2">
								<Text
									className="font-bold text-foreground text-lg"
									numberOfLines={2}
								>
									{item.title}
								</Text>
								<Text className="text-muted-foreground text-sm font-medium">
									{item.time}
								</Text>
							</View>
						</View>
						<View className="flex-row items-center justify-start min-w-1/3">
							<Avatar
								alt={`Avatar de ${item.studentName}`}
								className="mr-2"
							>
								<AvatarFallback>
									<Text className="text-xs font-bold">
										{item.studentInitials}
									</Text>
								</AvatarFallback>
							</Avatar>
							<Text className="font-medium text-sm text-foreground">
								{item.studentName}
							</Text>
						</View>
					</Pressable>
				)}
				className="flex-1"
				contentContainerStyle={{ paddingTop: 24 }}
				showsVerticalScrollIndicator={false}
			/>
		</View>
	);
}
