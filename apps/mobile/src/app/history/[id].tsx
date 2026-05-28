import { useLocalSearchParams } from "expo-router";
import { Clock, Cloud, Footprints, RotateCcw, Star } from "lucide-react-native";
import { ScrollView, View } from "react-native";

import { Address } from "@/components/address";
import { Header } from "@/components/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useUserRole } from "@/lib/auth-store";
import ScholarShiftDetails from "@/components/scholar/ScholarShiftDetails";

function StudentHistoryDetails() {
	return (
		<View className="flex-1">
			<Header title="Informações" />

			<ScrollView
				className="flex-1"
				contentContainerClassName="px-4 gap-4"
				showsVerticalScrollIndicator={false}
			>
				<View className="h-48 w-full bg-card rounded-md items-end justify-end">
					{/* Map placeholder */}
					<View className="flex flex-row items-center justify-end gap-2 p-4">
						<Badge className="text-primary-foreground">
							<Icon
								icon={Footprints}
								size={14}
								color="primary-foreground"
							/>
							<Text>2,1km</Text>
						</Badge>
						<Badge className="text-primary-foreground">
							<Icon
								icon={Clock}
								size={14}
								color="primary-foreground"
							/>
							<Text>29m</Text>
						</Badge>
					</View>
				</View>

				<View className="gap-1">
					<Text className="font-bold text-2xl">
						CAC - Pista da UFAL
					</Text>
					<Text className="text-muted-foreground text-base">
						6 de agosto • 19h
					</Text>
				</View>

				{/* Bolsista Profile */}
				<View className="flex-row items-center gap-3">
					<Avatar alt="Zach Nugent's Avatar">
						<AvatarImage
							source={{
								uri: "https://github.com/meninocoiso.png",
							}}
						/>
						<AvatarFallback>
							<Text>ZN</Text>
						</AvatarFallback>
					</Avatar>
					<View className="flex-1">
						<Text className="font-medium text-sm">
							Atendido por{" "}
							<Text className="font-semibold text-sm">
								João Carlos
							</Text>
						</Text>
					</View>
					<Badge
						variant="secondary"
						className="px-2 py-0.5 text-foreground"
					>
						<Icon icon={Cloud} size={14} color="foreground" />
						<Text>Manhã</Text>
					</Badge>
				</View>

				<View className={"w-full flex-col items-start"}>
					<Address
						marker="from"
						label="CAC - Centro de Artes e Cultura"
						className="border-b border-border px-3 py-4"
						size="lg"
					>
						<Text className="text-xs font-medium text-muted-foreground">
							8:04 PM
						</Text>
					</Address>
					<Address
						marker="to"
						label="Pista da UFAL"
						className="px-3 py-4"
						size="lg"
					>
						<Text className="text-xs font-medium text-muted-foreground">
							8:33 PM
						</Text>
					</Address>
				</View>

				{/* Action Buttons */}
				<View className="gap-3 w-full">
					<Button className="rounded-full w-full text-white">
						<Icon icon={Star} size={18} color="white" />
						<Text>Avaliar</Text>
					</Button>

					<Button className="rounded-full w-full text-white">
						<Icon icon={RotateCcw} size={18} color="white" />
						<Text>Reagendar</Text>
					</Button>
				</View>
			</ScrollView>
		</View>
	);
}

export default function HistoryDetails() {
	const role = useUserRole();
	return role === "scholar" ? <ScholarShiftDetails /> : <StudentHistoryDetails />;
}
