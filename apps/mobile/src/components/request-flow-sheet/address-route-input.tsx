// address-route-input.tsx

import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { Check, CircleX, MapPin, Navigation, Route } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { StatusMessage } from "@/components/status-message";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { useUnstableNativeVariable } from "@/lib/theme";
import { cn } from "@/lib/utils";

import { FromMarker, ToMarker } from "@/assets/route";
import { ufalPoints } from "@/constants/locations";

import { PlaceCard } from "../place-card";

const CURRENT_LOCATION = "__current_location__" as const;

type UfalPoint = (typeof ufalPoints)[number];
type SuggestionItem = {
	distance?: string;
} & (
	| { id: typeof CURRENT_LOCATION; name: "Sua posição atual"; abbrev: null }
	| (UfalPoint & { id: string })
);

export type AddressRouteInputProps = {
	origin: { name?: string; abbreviation?: string } | null;
	destination: { name?: string; abbreviation?: string } | null;
	onSelectOrigin: (name: string, isCurrentLocation: boolean) => void;
	onSelectDestination: (name: string) => void;
	className?: string;
};

const CURRENT_LOCATION_ITEM = {
	id: CURRENT_LOCATION,
	name: "Sua posição atual",
	abbrev: null,
} as const satisfies SuggestionItem;

// ── Distance utilities ──────────────────────────────────────────────

function haversineDistance(
	a: { latitude: number; longitude: number },
	b: { latitude: number; longitude: number },
): number {
	const R = 6_371_000;
	const toRad = (deg: number) => (deg * Math.PI) / 180;
	const φ1 = toRad(a.latitude);
	const φ2 = toRad(b.latitude);
	const Δφ = toRad(b.latitude - a.latitude);
	const Δλ = toRad(b.longitude - a.longitude);
	const x =
		Math.sin(Δφ / 2) ** 2 +
		Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
	return 2 * R * Math.asin(Math.sqrt(x));
}

/** Convert lat/lng to flat Cartesian meters (approximate, fine for small areas). */
function toMetersCoords(lat: number, lng: number) {
	const R = 6_371_000;
	const latRad = (lat * Math.PI) / 180;
	const lngRad = (lng * Math.PI) / 180;
	return {
		x: R * lngRad * Math.cos(latRad),
		y: R * latRad,
	};
}

/** Shortest distance (m) from `point` to the line segment `a`–`b`. */
function pointToLineDistance(
	point: { latitude: number; longitude: number },
	a: { latitude: number; longitude: number },
	b: { latitude: number; longitude: number },
): number {
	const P = toMetersCoords(point.latitude, point.longitude);
	const A = toMetersCoords(a.latitude, a.longitude);
	const B = toMetersCoords(b.latitude, b.longitude);

	const APx = P.x - A.x;
	const APy = P.y - A.y;
	const ABx = B.x - A.x;
	const ABy = B.y - A.y;

	const dot = APx * ABx + APy * ABy;
	const lenSq = ABx * ABx + ABy * ABy;
	let t = lenSq !== 0 ? dot / lenSq : -1;
	t = Math.max(0, Math.min(1, t));

	const closestX = A.x + t * ABx;
	const closestY = A.y + t * ABy;

	const dx = P.x - closestX;
	const dy = P.y - closestY;
	return Math.sqrt(dx * dx + dy * dy);
}

function formatDistance(meters: number): string {
	if (meters < 1_000) {
		return `${Math.round(meters)}m`;
	}
	return `${(meters / 1_000).toFixed(1)}km`;
}

/** Look up a UfalPoint by name so we can get coordinates. */
function findPoint(name: string): UfalPoint | undefined {
	return ufalPoints.find((p) => p.name === name);
}

// ── Sub-components ─────────────────────────────────────────────────

type SuggestionRowProps = {
	item: SuggestionItem;
	isSelected: boolean;
	distance?: string;
	onPress: (item: SuggestionItem) => void;
};

function SuggestionRow({
	item,
	isSelected,
	distance,
	onPress,
}: SuggestionRowProps) {
	const handlePress = useCallback(() => onPress(item), [item, onPress]);

	return (
		<PlaceCard
			title={item.abbrev ?? item.name}
			description={item.name}
			onPress={handlePress}
			icon={{
				name: "map",
				label: distance,
			}}
			className={cn("p-4 border-b border-border", {
				"bg-primary/10 border-primary/30": isSelected,
			})}
			variant="default"
		>
			{isSelected && (
				<View className="bg-primary rounded-full p-1">
					<Icon icon={Check} size={14} color="white" />
				</View>
			)}
		</PlaceCard>
	);
}

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

	const activateOrigin = () => setActiveField("origin");
	const activateDestination = () => setActiveField("destination");
	const clearOriginQuery = () => setOriginQuery("");
	const clearDestinationQuery = () => setDestinationQuery("");

	// Auto-focus the destination input when the sheet opens
	useEffect(() => {
		setActiveField("destination");
		requestAnimationFrame(() => {
			destinationInputRef.current?.focus();
		});
	}, []);

	const suggestions = useMemo<SuggestionItem[]>(() => {
		const query = (
			activeField === "origin" ? originQuery : destinationQuery
		)
			.toLowerCase()
			.trim();

		// Resolve reference points for distance calculation
		const originPoint = origin?.name ? findPoint(origin.name) : undefined;
		const destPoint = destination?.name
			? findPoint(destination.name)
			: undefined;
		const points: SuggestionItem[] = ufalPoints
			.filter(
				(p) =>
					!query ||
					p.name.toLowerCase().includes(query) ||
					(p.abbrev?.toLowerCase().includes(query) ?? false),
			)
			.map((p) => {
				let distanceStr: string | undefined;

				if (originPoint && destPoint) {
					// Both origin and destination are known → show cross-track distance
					distanceStr = formatDistance(
						pointToLineDistance(p, originPoint, destPoint),
					);
				} else if (activeField === "origin" && destPoint) {
					// Selecting origin, destination is set → show distance from destination
					distanceStr = formatDistance(
						haversineDistance(p, destPoint),
					);
				} else if (activeField === "destination" && originPoint) {
					// Selecting destination, origin is set → show distance from origin
					distanceStr = formatDistance(
						haversineDistance(p, originPoint),
					);
				}

				return { ...p, id: p.name, distance: distanceStr };
			});

		if (activeField === "origin") {
			return [CURRENT_LOCATION_ITEM, ...points];
		}
		return points;
	}, [activeField, originQuery, destinationQuery, origin, destination]);

	const handleSelectSuggestion = useCallback(
		(item: SuggestionItem) => {
			if (activeField === "origin") {
				onSelectOrigin(item.name, item.id === CURRENT_LOCATION);
				setOriginQuery("");
				originInputRef.current?.blur();
			} else {
				onSelectDestination(item.name);
				setDestinationQuery("");
				destinationInputRef.current?.blur();
			}
			setActiveField(null);
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
				data={suggestions}
				keyExtractor={(item) => item.id}
				contentContainerClassName={"px-4 py-4"}
				renderItem={renderSuggestion}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
				ListEmptyComponent={
					<Text className="py-6 text-center text-sm text-muted-foreground">
						Nenhum local encontrado
					</Text>
				}
			/>
			{/*{activeField ? (
				<BottomSheetFlatList
					data={suggestions}
					keyExtractor={(item) => item.id}
					contentContainerClassName={"px-4 py-4"}
					renderItem={renderSuggestion}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
					ListEmptyComponent={
						<Text className="py-6 text-center text-sm text-muted-foreground">
							Nenhum local encontrado
						</Text>
					}
				/>
			) : origin && destination ? (
				<StatusMessage
					icon={<Icon icon={Route} color="--foreground" size={32} />}
					className="max-w-2/3 mx-auto"
					title="Agora é só confirmar"
					description="A origem e o destino estão selecionados. Clique em confirmar para continuar."
				/>
			) : (
				<StatusMessage
					icon={<Icon icon={Route} color="--foreground" size={32} />}
					className="max-w-2/3 mx-auto"
					title="Selecione a origem e o destino"
					description="Digite o endereço de origem e o endereço de destino para encontrar uma rota."
				/>
			)}*/}
		</View>
	);
}

export { AddressRouteInput };
