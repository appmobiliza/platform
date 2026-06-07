import { Link } from "expo-router";
import { ClockAlert } from "lucide-react-native";
import { Text, View } from "react-native";

import { Icon } from "@/components/ui/icon";

// import MapView from "@/components/ui/map";

interface FeaturedHistoryCardProps {
	title: string;
	date: string;
	href: string;
	status?: string;
}

export const FeaturedHistoryCard = ({
	title,
	date,
	href,
	status,
}: FeaturedHistoryCardProps) => {
	const isUnattended = status === "unattended";

	return (
		<Link href={href} push asChild>
			<View
				accessibilityLabel={`Deslocamento: ${title}`}
				accessibilityHint="Duplo toque para ver detalhes"
				accessibilityRole="button"
				className="rounded-lg overflow-hidden mb-6 border border-white shadow-sm"
			>
				<View className="h-40 w-full bg-card">
					{/* <MapView
					style={{ flex: 1 }}
					initialRegion={{
						latitude: -9.5539,
						longitude: -35.7722, // Approximate UFAL coordinates
						latitudeDelta: 0.005,
						longitudeDelta: 0.005,
					}}
					scrollEnabled={false}
					zoomEnabled={false}
					pitchEnabled={false}
					rotateEnabled={false}
				/> */}
					{isUnattended && (
						<View className="flex-1 items-center justify-center">
							<Icon
								icon={ClockAlert}
								size={48}
								color="--muted-foreground"
							/>
						</View>
					)}
				</View>
				<View
					className={
						isUnattended ? "bg-destructive p-4" : "bg-primary p-4"
					}
				>
					<Text className="text-primary-foreground font-bold text-xl">
						{title}
					</Text>
					<Text className="text-primary-foreground/80 text-sm mt-1">
						{date}
					</Text>
					{isUnattended && (
						<Text className="text-destructive-foreground/80 text-xs mt-1 font-medium">
							Não atendida — tempo expirado
						</Text>
					)}
				</View>
			</View>
		</Link>
	);
};
