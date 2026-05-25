export type Stage =
	| "destination"
	| "destination-selection"
	| "start-confirm"
	| "start-edit"
	| "searching"
	| "trip";

export type ActionVariant = "primary" | "outline" | "soft" | "destructive";

export type DestinationOption = {
	label: string;
	description: string;
	distance: string;
	highlighted: boolean;
};

export const DESTINATION_OPTIONS = [
	{
		label: "CEPETEC",
		description: "Instituto de Computação, UFAL",
		distance: "6.2km",
		highlighted: false,
	},
	{
		label: "CAC",
		description: "Centro de Artes e Comunicação, UFAL",
		distance: "2.1km",
		highlighted: true,
	},
	{
		label: "CETEC",
		description: "Centro de Tecnologia, UFAL",
		distance: "5.8km",
		highlighted: false,
	},
] as const satisfies ReadonlyArray<DestinationOption>;
