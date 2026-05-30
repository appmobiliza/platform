import { Clock, Cloud, Footprints, RotateCcw, Star } from "lucide-react-native";
import { View } from "react-native";

import ScholarHistoryDetails from "@/components/scholar/history-details";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { useUserRole } from "@/lib/auth-store";

import { HistoryDetailLayout } from "@/layout/history-details";

function StudentHistoryDetails() {
	return (
		<HistoryDetailLayout
			title="CAC - Pista da UFAL"
			subtitle="6 de agosto • 19h"
			mapBadges={
				<>
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
				</>
			}
			profile={
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
			}
			route={{
				className: "w-full",
				from: {
					label: "CAC - Centro de Artes e Cultura",
					className: "px-3 py-4",
					children: (
						<Text className="text-xs font-medium text-muted-foreground">
							8:04 PM
						</Text>
					),
				},
				to: {
					label: "Pista da UFAL",
					className: "px-3 py-4",
					children: (
						<Text className="text-xs font-medium text-muted-foreground">
							8:33 PM
						</Text>
					),
				},
			}}
		>
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
		</HistoryDetailLayout>
	);
}

export default function HistoryDetails() {
	const role = useUserRole();

	return role === "scholar" ? (
		<ScholarHistoryDetails />
	) : (
		<StudentHistoryDetails />
	);
}
