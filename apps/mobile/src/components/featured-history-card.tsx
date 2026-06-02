import { Link } from "expo-router";
import { RotateCcw, Star } from "lucide-react-native";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/button";

// import MapView from "@/components/ui/map";

interface FeaturedHistoryCardProps {
	title: string;
	date: string;
	href: string;
}

export const FeaturedHistoryCard = ({
	title,
	date,
	href,
}: FeaturedHistoryCardProps) => {
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
				</View>
				<View className="bg-primary p-4">
					<Text className="text-primary-foreground font-bold text-xl">
						{title}
					</Text>
					<Text className="text-primary-foreground/80 text-sm mt-1">
						{date}
					</Text>

					<View className="flex-row gap-3 mt-4">
						<Button className="bg-white text-black hover:bg-muted active:bg-muted dark:active:bg-muted rounded-full">
							<Star size={16} color="black" />
							<Text className="font-medium">Avaliar</Text>
						</Button>
						<Button className="bg-white text-black hover:bg-muted active:bg-muted dark:active:bg-muted rounded-full">
							<RotateCcw size={16} color="black" />
							<Text className="font-medium">Reagendar</Text>
						</Button>
					</View>
				</View>
			</View>
		</Link>
	);
};
