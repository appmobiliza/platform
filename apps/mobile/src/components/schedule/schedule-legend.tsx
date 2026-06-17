import { Text, View } from "react-native";

import { getPersonColor, type PersonColor } from "./colors";

interface ScheduleLegendProps {
	/** Which people to show. Defaults to an empty array. */
	people?: string[];
	colorMap?: Map<string, PersonColor>;
}

/** Color legend mapping each color to a person's name. */
export function ScheduleLegend({ people = [], colorMap }: ScheduleLegendProps) {
	if (people.length === 0) return null;

	return (
		<View className="flex-row flex-wrap justify-center gap-x-6 gap-y-3 px-4 py-6">
			{people.map((person) => {
				const color = getPersonColor(person, colorMap);
				return (
					<View key={person} className="flex-row items-center gap-2">
						<View className={`h-3 w-3 rounded-full ${color.dot}`} />
						<Text className="text-base text-muted-foreground">
							{person}
						</Text>
					</View>
				);
			})}
		</View>
	);
}
