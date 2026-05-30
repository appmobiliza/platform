import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";

// Mocking services in the shift
const services = [
	{
		id: "s1",
		title: "CAC - Centro de Artes e Cultura",
		time: "18:00 - 18:23",
		studentName: "João Carlos",
		studentInitials: "JC",
		avatarBg: "#EAF3DE",
		avatarColor: "#27500A",
	},
	{
		id: "s2",
		title: "Auditório Principal",
		time: "18:30 - 18:53",
		studentName: "João Carlos",
		studentInitials: "JC",
		avatarBg: "#EAF3DE",
		avatarColor: "#27500A",
	},
	{
		id: "s3",
		title: "Sala de Estudo do COS",
		time: "19:00 - 19:23",
		studentName: "Ana Beatriz",
		studentInitials: "AB",
		avatarBg: "#E6F4F5",
		avatarColor: "#005E65",
	},
	{
		id: "s4",
		title: "Cafeteria",
		time: "19:30 - 19:53",
		studentName: "Lucas Mendes",
		studentInitials: "LM",
		avatarBg: "#FCEBEB",
		avatarColor: "#A32D2D",
	},
];

export default function ScholarShiftDetails() {
	const { id } = useLocalSearchParams();
	const router = useRouter();

	return (
		<View className="flex-1 bg-background">
			{/* Simple Header */}
			<View className="px-4 py-6 border-b border-border bg-card flex-row items-center">
				<ChevronLeft
					size={28}
					color="currentColor"
					className="text-foreground mr-4"
					onPress={() => router.back()}
				/>
				<View>
					<Text className="font-extrabold text-2xl text-foreground">
						1 de agosto
					</Text>
					<Text className="font-medium text-muted-foreground text-sm">
						4 deslocamentos
					</Text>
				</View>
			</View>

			<ScrollView
				className="flex-1 pt-6 px-4"
				showsVerticalScrollIndicator={false}
			>
				{services.map((service, index) => (
					<Pressable
						key={service.id}
						onPress={() => router.push(`/history/${service.id}`)}
						className="flex-row items-center mb-6"
					>
						<View className="bg-primary w-12 h-12 rounded-xl items-center justify-center mr-4">
							<Text className="text-white text-xs font-bold">
								⏱
							</Text>
						</View>
						<View className="flex-1 mr-2">
							<Text
								className="font-bold text-foreground mb-1"
								numberOfLines={1}
							>
								{service.title}
							</Text>
							<Text className="text-muted-foreground text-sm font-medium">
								{service.time}
							</Text>
						</View>
						<View className="flex-row items-center">
							<Avatar
								alt={`${service.studentName}'s Avatar`}
								className="h-8 w-8 mr-2"
								style={{ backgroundColor: service.avatarBg }}
							>
								<AvatarFallback>
									<Text
										className="text-xs font-bold"
										style={{ color: service.avatarColor }}
									>
										{service.studentInitials}
									</Text>
								</AvatarFallback>
							</Avatar>
							<Text className="font-medium text-sm text-foreground">
								{service.studentName.split(" ")[0]}
							</Text>
						</View>
					</Pressable>
				))}
			</ScrollView>
		</View>
	);
}
