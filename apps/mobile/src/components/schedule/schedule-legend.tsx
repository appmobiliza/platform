import { Text, View } from "react-native";

import { LEGEND_ORDER, PERSON_COLORS } from "./colors";
import type { PersonId } from "./types";

interface ScheduleLegendProps {
	/** Which people to show. Defaults to all, in the canonical order. */
	people?: PersonId[];
}

/** Color legend mapping each color to a person's name. */
export function ScheduleLegend({ people = LEGEND_ORDER }: ScheduleLegendProps) {
	return (
		<View className="flex-row flex-wrap justify-center gap-x-6 gap-y-3 px-4 py-6">
			{people.map((person) => {
				const color = PERSON_COLORS[person];
				return (
					<View key={person} className="flex-row items-center gap-2">
						<View className={`h-3 w-3 rounded-full ${color.dot}`} />
						<Text className="text-base text-muted-foreground">
							{color.name}
						</Text>
					</View>
				);
			})}
		</View>
	);
}
