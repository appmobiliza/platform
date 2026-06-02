// address-route-input.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { CircleX, MapPin, Navigation, Route } from "lucide-react-native";
import { Pressable, TextInput, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { useUnstableNativeVariable } from "@/lib/theme";
import { cn } from "@/lib/utils";

import { FromMarker, ToMarker } from "@/assets/route";
import { ufalPoints } from "@/constants/locations";

import { StatusMessage } from "../status-message";

const CURRENT_LOCATION = "__current_location__" as const;

type UfalPoint = (typeof ufalPoints)[number];
type SuggestionItem =
	| { id: typeof CURRENT_LOCATION; name: "Sua posição atual"; abbrev: null }
	| (UfalPoint & { id: string });

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

type SuggestionRowProps = {
	item: SuggestionItem;
	isSelected: boolean;
	onPress: (item: SuggestionItem) => void;
};

function SuggestionRow({ item, isSelected, onPress }: SuggestionRowProps) {
	const isCurrent = item.id === CURRENT_LOCATION;
	const handlePress = useCallback(() => onPress(item), [item, onPress]);

	return (
		<Pressable
			onPress={handlePress}
			className={cn(
				"flex-row items-center gap-3 px-4 py-3 border-b border-border",
				isSelected && "bg-primary/10",
			)}
		>
			<View
				className={cn(
					"size-9 items-center justify-center rounded-md",
					isCurrent ? "bg-primary/15" : "bg-muted",
				)}
			>
				<Icon
					icon={isCurrent ? Navigation : MapPin}
					size={17}
					color={isCurrent ? "--primary" : "--muted-foreground"}
				/>
			</View>
			<View className="flex-1">
				<Text
					className={cn(
						"text-sm font-medium",
						isCurrent && "text-primary",
					)}
					numberOfLines={1}
				>
					{item.name}
				</Text>
				{item.abbrev && (
					<Text className="text-xs text-muted-foreground mt-0.5">
						{item.abbrev}
					</Text>
				)}
			</View>
		</Pressable>
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

	const activeFieldRef = useRef(activeField);
	activeFieldRef.current = activeField;
	const onSelectOriginRef = useRef(onSelectOrigin);
	onSelectOriginRef.current = onSelectOrigin;
	const onSelectDestinationRef = useRef(onSelectDestination);
	onSelectDestinationRef.current = onSelectDestination;

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

		const points: SuggestionItem[] = ufalPoints
			.filter(
				(p) =>
					!query ||
					p.name.toLowerCase().includes(query) ||
					(p.abbrev?.toLowerCase().includes(query) ?? false),
			)
			.map((p) => ({ ...p, id: p.name }));

		if (activeField === "origin") {
			return [CURRENT_LOCATION_ITEM, ...points];
		}
		return points;
	}, [activeField, originQuery, destinationQuery]);

	const handleSelectSuggestion = useCallback((item: SuggestionItem) => {
		const field = activeFieldRef.current;
		if (field === "origin") {
			onSelectOriginRef.current(item.name, item.id === CURRENT_LOCATION);
			setOriginQuery("");
			originInputRef.current?.blur();
		} else {
			onSelectDestinationRef.current(item.name);
			setDestinationQuery("");
			destinationInputRef.current?.blur();
		}
		setActiveField(null);
	}, []);

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

			{activeField ? (
				<BottomSheetFlatList
					data={suggestions}
					keyExtractor={(item) => item.id}
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
			)}
		</View>
	);
}

export { AddressRouteInput };
