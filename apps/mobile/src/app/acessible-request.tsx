import { ScrollView } from "react-native";

import type { Place } from "@/components/request-flow-sheet/types";
import { AccessibleRequestFlow } from "@/components/simplified-interface/request-flow";

import {
	getCachedCampusLocations,
	useNearestPoint,
} from "@/lib/location-store";
import { trpc } from "@/lib/trpc/client";

export default function AccessibleRequest() {
	const nearestPoint = useNearestPoint();

	const { data: campusLocations = [] } = trpc.locations.list.useQuery(
		undefined,
		{
			staleTime: 30 * 60 * 1000,
		},
	);

	const locations =
		campusLocations.length > 0
			? (campusLocations as Place[])
			: (getCachedCampusLocations() as Place[]);

	return (
		<ScrollView
			className="flex-1 bg-background"
			showsVerticalScrollIndicator={false}
			keyboardShouldPersistTaps="handled"
		>
			<AccessibleRequestFlow
				campusLocations={locations}
				nearestPoint={nearestPoint}
			/>
		</ScrollView>
	);
}
