import { getPersonColor } from "./colors";

interface ScheduleLegendProps {
	/** Which people to show. Defaults to an empty array. */
	people?: string[];
}

/** Color legend mapping each color to a person's name. */
export function ScheduleLegend({ people = [] }: ScheduleLegendProps) {
	if (people.length === 0) return null;

	return (
		<div className="flex flex-row flex-wrap justify-center gap-x-6 gap-y-3 px-4 py-6">
			{people.map((person) => {
				const color = getPersonColor(person);
				return (
					<div
						key={person}
						className="flex flex-row items-center gap-2"
					>
						<div className={`h-3 w-3 rounded-full ${color.dot}`} />
						<span className="text-base text-muted-foreground">
							{person}
						</span>
					</div>
				);
			})}
		</div>
	);
}
