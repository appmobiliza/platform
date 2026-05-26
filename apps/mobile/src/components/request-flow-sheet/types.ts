export type Stage =
	| "destination"
	| "destination-selection"
	| "start-confirm"
	| "searching"
	| "trip";

export type ActionVariant = "primary" | "outline" | "soft" | "destructive";

export type DestinationOption = {
	label: string;
	description: string;
	distance: string;
};

export const DESTINATION_OPTIONS = [
	{
		label: "CEPETEC",
		description: "Instituto de Computação, UFAL",
		distance: "6.2km",
	},
	{
		label: "CAC",
		description: "Centro de Artes e Comunicação, UFAL",
		distance: "2.1km",
	},
	{
		label: "CETEC",
		description: "Centro de Tecnologia, UFAL",
		distance: "5.8km",
	},
] as const satisfies ReadonlyArray<DestinationOption>;
