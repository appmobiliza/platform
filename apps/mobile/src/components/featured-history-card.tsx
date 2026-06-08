import { Link } from "expo-router";
import { ClockAlert } from "lucide-react-native";
import { Text, View } from "react-native";

import MapView from "@/components/map/map-view";
import { Icon } from "@/components/ui/icon";

interface FeaturedHistoryCardProps {
	title: string;
	date: string;
	href: string;
	status?: string;
	originLatitude?: number;
	originLongitude?: number;
	destinationLatitude?: number;
	destinationLongitude?: number;
}

export const FeaturedHistoryCard = ({
	title,
	date,
	href,
	status,
	originLatitude,
	originLongitude,
	destinationLatitude,
	destinationLongitude,
}: FeaturedHistoryCardProps) => {
	const isUnattended = status === "unattended";
	const hasCoords =
		originLatitude != null &&
		originLongitude != null &&
		destinationLatitude != null &&
		destinationLongitude != null;

	const routePath: Array<[number, number]> | undefined = hasCoords
		? [
				[originLongitude!, originLatitude!],
				[destinationLongitude!, destinationLatitude!],
			]
		: undefined;

	return (
		<Link href={href} push asChild>
			<View
				accessibilityLabel={`Deslocamento: ${title}`}
				accessibilityHint="Duplo toque para ver detalhes"
				accessibilityRole="button"
				className="rounded-lg overflow-hidden mb-6 border border-white shadow-sm"
			>
				<View className="h-40 w-full">
					{hasCoords ? (
						<MapView
							routePath={routePath}
							interactive={false}
							initialViewState={{
								latitude:
									(originLatitude! + destinationLatitude!) /
									2,
								longitude:
									(originLongitude! + destinationLongitude!) /
									2,
								zoom: 15,
							}}
						/>
					) : null}
					{isUnattended && (
						<View className="absolute inset-0 items-center justify-center bg-card">
							<Icon
								icon={ClockAlert}
								size={48}
								color="--muted-foreground"
							/>
						</View>
					)}
					{!hasCoords && !isUnattended && (
						<View className="flex-1 bg-card h-40" />
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
