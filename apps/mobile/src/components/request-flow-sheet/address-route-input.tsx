// address-route-input.tsx

import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { Check, CircleX, MapPin, Navigation, Route } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { StatusMessage } from "@/components/status-message";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import {
	formatDistance,
	haversineDistance,
	pointToLineDistance,
} from "@/lib/distance";
import { useUnstableNativeVariable } from "@/lib/theme";
import { cn } from "@/lib/utils";

import { FromMarker, ToMarker } from "@/assets/route";
import { ufalPoints } from "@/constants/locations";

import { PlaceCard } from "../place-card";

const CURRENT_LOCATION = "__current_location__" as const;

type UfalPoint = (typeof ufalPoints)[number];
type SuggestionItem = {
	distance?: string;
	distanceMeters?: number;
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
			.filter((p) => {
				// Remove the already-selected origin from the destination list
				if (activeField === "destination" && origin?.name === p.name) {
					return false;
				}
				// Remove the already-selected destination from the origin list
				if (activeField === "origin" && destination?.name === p.name) {
					return false;
				}
				return true;
			})
			.map((p) => {
				let distanceMeters: number | undefined;

				if (originPoint && destPoint) {
					// Both origin and destination are known → show cross-track distance
					distanceMeters = pointToLineDistance(
						p,
						originPoint,
						destPoint,
					);
				} else if (activeField === "origin" && destPoint) {
					// Selecting origin, destination is set → show distance from destination
					distanceMeters = haversineDistance(p, destPoint);
				} else if (activeField === "destination" && originPoint) {
					// Selecting destination, origin is set → show distance from origin
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

		// Sort from closest to farthest when distances are available
		const anyDistance = points.some((p) => p.distanceMeters !== undefined);
		if (anyDistance) {
			points.sort((a, b) => {
				if (a.distanceMeters === undefined) return 1;
				if (b.distanceMeters === undefined) return -1;
				return a.distanceMeters - b.distanceMeters;
			});
		}

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
