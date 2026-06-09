import type { ViewStyle } from "react-native";

import type { Place } from "@/components/request-flow-sheet/types";

import type { CampusLocation } from "@/types/location";

// ─── Step data shape ──────────────────────────────────────────────────────

export interface AcessibleRequestStep {
	subtitle?: string;
	title: string;
	note: string | React.ReactNode;
	children: React.ReactNode;
}

// ─── Flow stages ──────────────────────────────────────────────────────────

export type FlowStage =
	| "listening"
	| "confirm"
	| "searching"
	| "unattended"
	| "request-error"
	| "scholar-found"
	| "in-transit";

// ─── Helper: convert Place (with lat/lng) to CampusLocation ───────────────

export function toCampusLocation(p: Place): CampusLocation {
	return {
		id: p.id ?? p.name,
		name: p.name,
		abbreviations: p.abbreviation ? [p.abbreviation] : undefined,
	};
}

// ─── Base props every step component receives ─────────────────────────────

export interface StepBaseProps {
	style?: ViewStyle;
}
