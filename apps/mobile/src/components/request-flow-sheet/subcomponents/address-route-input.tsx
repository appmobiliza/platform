// address-route-input.tsx

import {
	BottomSheetFlatList,
	type BottomSheetFlatListMethods,
} from "@gorhom/bottom-sheet";
import { Check, CircleX, Locate, MapPin } from "lucide-react-native";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { PlaceCard } from "@/components/place-card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import {
	formatDistance,
	haversineDistance,
	pointToLineDistance,
} from "@/lib/geo/distance";
import { useUnstableNativeVariable } from "@/lib/theme";
import { cn } from "@/lib/utils";

import { FromMarker, ToMarker } from "@/assets/route";

import type { Place } from "../types";

const CURRENT_LOCATION = "__current_location__" as const;

type LocationItem = {
	name: string;
	latitude: number;
	longitude: number;
	abbreviation?: string;
	/** Alias for `abbreviation` used by suggestion rendering */
	abbrev?: string;
};

type SuggestionItem = {
	distance?: string;
	distanceMeters?: number;
} & (
	| {
			id: typeof CURRENT_LOCATION;
			name: "Sua posição atual";
			abbrev: null;
			latitude: never;
			longitude: never;
	  }
	| (LocationItem & { id: string })
);

export type AddressRouteInputProps = {
	origin: Place | null;
	destination: Place | null;
	locations: LocationItem[];
	onSelectOrigin: (name: string, isCurrentLocation: boolean) => void;
	onSelectDestination: (name: string) => void;
	className?: string;
};

const CURRENT_LOCATION_ITEM = {
	id: CURRENT_LOCATION,
	name: "Sua posição atual",
	abbrev: null,
	latitude: undefined as never,
	longitude: undefined as never,
} as const satisfies SuggestionItem;

// ── Sub-components ─────────────────────────────────────────────────

type SuggestionRowProps = {
	item: SuggestionItem;
	isSelected: boolean;
	distance?: string;
	onPress: (item: SuggestionItem) => void;
};

const SuggestionRow = memo(function SuggestionRow({
	item,
	isSelected,
	distance,
	onPress,
}: SuggestionRowProps) {
	const isCurrentLocation = item.id === CURRENT_LOCATION;
	const handlePress = useCallback(() => onPress(item), [item, onPress]);

	return (
		<PlaceCard
			title={item.abbrev ?? item.name}
			description={item.name}
			onPress={handlePress}
			icon={{
				as: isCurrentLocation ? Locate : MapPin,
				label: distance,
				className: isCurrentLocation
					? "bg-primary rounded-full p-3 w-10"
					: "w-10",
				color: isCurrentLocation ? undefined : "--foreground",
			}}
			className={cn("p-4 border-b border-border rounded-lg", {
				"bg-input border-none": isSelected,
			})}
			variant="default"
		>
			{isSelected && (
				<View className="bg-foreground rounded-full p-1">
					<Icon icon={Check} size={14} color="--card" />
				</View>
			)}
		</PlaceCard>
	);
});

type RouteInputProps = {
	inputRef: React.RefObject<TextInput | null>;
	value: string;
	selectedName?: string;
	isActive: boolean;
	placeholder: string;
	onFocus: () => void;
	onChangeText: (text: string) => void;
	onClear: () => void;
};

function RouteInput({
	inputRef,
	value,
	selectedName,
	isActive,
	placeholder,
	onFocus,
	onChangeText,
	onClear,
}: RouteInputProps) {
	return (
		<View className="flex-row items-center gap-2">
			<TextInput
				ref={inputRef}
				value={isActive ? value : (selectedName ?? "")}
				onChangeText={onChangeText}
				onFocus={onFocus}
				placeholder={placeholder}
				className="flex-1 text-base text-foreground"
				caretHidden={!isActive}
				returnKeyType="search"
				numberOfLines={1}
			/>
			{isActive && value.length > 0 && (
				<Pressable onPress={onClear} hitSlop={8}>
					<Icon icon={CircleX} size={18} color="--muted-foreground" />
				</Pressable>
			)}
		</View>
	);
}

// ── Main component ─────────────────────────────────────────────────

function AddressRouteInput({
	origin,
	destination,
	locations,
	onSelectOrigin,
	onSelectDestination,
	className,
}: AddressRouteInputProps) {
	const primaryColor = useUnstableNativeVariable("--primary");
	const [activeField, setActiveField] = useState<
		"origin" | "destination" | null
	>(null);
	const [originQuery, setOriginQuery] = useState("");
	const [destinationQuery, setDestinationQuery] = useState("");

	const originInputRef = useRef<TextInput>(null);
	const destinationInputRef = useRef<TextInput>(null);
	const flatListRef = useRef<BottomSheetFlatListMethods>(null);

	const activateOrigin = useCallback(() => setActiveField("origin"), []);
	const activateDestination = useCallback(
		() => setActiveField("destination"),
		[],
	);
	const clearOriginQuery = useCallback(() => setOriginQuery(""), []);
	const clearDestinationQuery = useCallback(
		() => setDestinationQuery(""),
		[],
	);

	// Auto-focus the destination input when the sheet opens (if destination is not already set)
	// biome-ignore lint/correctness/useExhaustiveDependencies: destination is checked for null, so dependencies are exhaustive
	useEffect(() => {
		if (destination === null) {
			setActiveField("destination");
			requestAnimationFrame(() => {
				destinationInputRef.current?.focus();
			});
		}
	}, []);

	// Scroll to top when the user switches between origin/destination fields
	useEffect(() => {
		if (activeField !== null) {
			flatListRef.current?.scrollToOffset({
				offset: 0,
				animated: true,
			});
		}
	}, [activeField]);

	// Build a lookup map from the locations prop
	const locationsByName = useMemo(
		() => new Map(locations.map((p) => [p.name, p])),
		[locations],
	);

	// Stable reference points — only recompute when selections change,
	// not on every keystroke.
	const referencePoints = useMemo(
		() => ({
			origin: origin?.name ? locationsByName.get(origin.name) : undefined,
			dest: destination?.name
				? locationsByName.get(destination.name)
				: undefined,
		}),
		[origin, destination, locationsByName],
	);

	// Remembers the last sorted order so post-selection renders reuse it
	// directly — distances stay correct and nothing moves.
	const stableSuggestionsRef = useRef<SuggestionItem[]>([]);

	const suggestions = useMemo<SuggestionItem[]>(() => {
		if (locations.length === 0) return [];

		const query = (
			activeField === "origin" ? originQuery : destinationQuery
		)
			.toLowerCase()
			.trim();

		const { origin: originPoint, dest: destPoint } = referencePoints;

		const effectiveField =
			activeField ??
			(origin && !destination
				? "destination"
				: !origin && destination
					? "origin"
					: "destination");

		const points: SuggestionItem[] = locations
			.filter(
				(p) =>
					!query ||
					p.name.toLowerCase().includes(query) ||
					(p.abbrev ?? p.abbreviation ?? "")
						.toLowerCase()
						.includes(query),
			)
			.filter((p) => {
				// Always exclude the opposite field's selection
				if (effectiveField === "destination" && origin?.name === p.name)
					return false;
				if (effectiveField === "origin" && destination?.name === p.name)
					return false;
				// When a field is active, also exclude its own previous
				// selection so it doesn't appear with distance=0 / checkmark
				if (
					activeField === "destination" &&
					destination?.name === p.name
				)
					return false;
				if (activeField === "origin" && origin?.name === p.name)
					return false;
				return true;
			})
			.map((p) => {
				// No distance shown for origin suggestions — there's no meaningful
				// reference point yet, and cross-track distance once both are set
				// would be 0 for the selected item.
				if (effectiveField === "origin") {
					return { ...p, id: p.name };
				}

				let distanceMeters: number | undefined;

				if (originPoint && destPoint) {
					distanceMeters = pointToLineDistance(
						p,
						originPoint,
						destPoint,
					);
				} else if (originPoint) {
					distanceMeters = haversineDistance(p, originPoint);
				}

				return {
					...p,
					id: p.name,
					distanceMeters,
					distance:
						distanceMeters !== undefined
							? formatDistance(distanceMeters)
							: undefined,
				};
			});

		const withHeader: SuggestionItem[] =
			effectiveField === "origin"
				? [CURRENT_LOCATION_ITEM, ...points]
				: points;

		// While the user is actively searching: sort and snapshot the order.
		if (activeField !== null) {
			const anyDistance = points.some(
				(p) => p.distanceMeters !== undefined,
			);
			if (anyDistance) {
				withHeader.sort((a, b) => {
					if (
						a.distanceMeters === undefined &&
						b.distanceMeters === undefined
					)
						return 0;
					if (a.distanceMeters === undefined) return 1;
					if (b.distanceMeters === undefined) return -1;
					return a.distanceMeters - b.distanceMeters;
				});
			}
			stableSuggestionsRef.current = withHeader;
			return withHeader;
		}

		// Idle (post-selection): keep the stable snapshot as-is — distances are
		// already correct from when the user was actively searching. Only drop
		// items that have since been filtered out (e.g. the newly selected item).
		const visibleIds = new Set(withHeader.map((p) => p.id));
		const rehydrated = stableSuggestionsRef.current.filter((p) =>
			visibleIds.has(p.id),
		);

		// First render before any interaction — fall back to computed order.
		if (rehydrated.length === 0) {
			stableSuggestionsRef.current = withHeader;
			return withHeader;
		}

		stableSuggestionsRef.current = rehydrated;
		return rehydrated;
	}, [
		activeField,
		originQuery,
		destinationQuery,
		origin,
		destination,
		referencePoints,
		locations,
	]);

	const handleSelectSuggestion = useCallback(
		(item: SuggestionItem) => {
			if (activeField === "origin") {
				onSelectOrigin(item.name, item.id === CURRENT_LOCATION);
				setOriginQuery("");
				// Automatically move focus to destination after picking an origin
				setActiveField("destination");
				requestAnimationFrame(() => {
					destinationInputRef.current?.focus();
				});
			} else {
				onSelectDestination(item.name);
				setDestinationQuery("");
				destinationInputRef.current?.blur();
				setActiveField(null);
			}
		},
		[activeField, onSelectOrigin, onSelectDestination],
	);

	const renderSuggestion = useCallback(
		({ item }: { item: SuggestionItem }) => {
			const isCurrent = item.id === CURRENT_LOCATION;
			const isSelected =
				activeField === "origin"
					? isCurrent
						? origin === null
						: origin?.name === item.name
					: destination?.name === item.name;

			return (
				<SuggestionRow
					item={item}
					isSelected={isSelected}
					distance={item.distance}
					onPress={handleSelectSuggestion}
				/>
			);
		},
		[activeField, origin, destination, handleSelectSuggestion],
	);

	return (
		<View className={cn("flex-1", className)}>
			<View className="flex-row gap-4 mx-4 mt-4 bg-input px-4 py-2 rounded-lg">
				<View className="items-center pt-1 pb-1" style={{ width: 20 }}>
					<FromMarker width={28} height={28} fill={primaryColor} />
					<View className="flex-1 w-0.5 bg-primary my-1" />
					<ToMarker width={28} height={28} fill={primaryColor} />
				</View>

				<View className="flex-1 gap-0">
					<RouteInput
						inputRef={originInputRef}
						value={originQuery}
						selectedName={origin?.name}
						isActive={activeField === "origin"}
						placeholder="Selecionar origem"
						onFocus={activateOrigin}
						onChangeText={setOriginQuery}
						onClear={clearOriginQuery}
					/>
					<View className="h-px bg-foreground/30" />
					<RouteInput
						inputRef={destinationInputRef}
						value={destinationQuery}
						selectedName={destination?.name}
						isActive={activeField === "destination"}
						placeholder="Selecionar destino"
						onFocus={activateDestination}
						onChangeText={setDestinationQuery}
						onClear={clearDestinationQuery}
					/>
				</View>
			</View>

			<BottomSheetFlatList
				ref={flatListRef}
				data={suggestions}
				keyExtractor={(item) => item.id}
				contentContainerClassName={"px-2 py-4"}
				renderItem={renderSuggestion}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
				ListEmptyComponent={
					<Text className="py-6 text-center text-sm text-muted-foreground">
						Nenhum local encontrado
					</Text>
				}
			/>
		</View>
	);
}

export { AddressRouteInput };
