// address-route-input.tsx
import { useCallback, useMemo, useRef, useState } from "react";

import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { MapPin, Navigation, X } from "lucide-react-native";
import { Pressable, TextInput, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { useUnstableNativeVariable } from "@/lib/theme";
import { cn } from "@/lib/utils";

import { FromMarker, ToMarker } from "@/assets/route";
import { ufalPoints } from "@/constants/locations";

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

	const activateField = useCallback((field: "origin" | "destination") => {
		setActiveField(field);
		setTimeout(() => {
			if (field === "origin") originInputRef.current?.focus();
			else destinationInputRef.current?.focus();
		}, 50);
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
			return [
				{
					id: CURRENT_LOCATION,
					name: "Sua posição atual",
					abbrev: null,
				},
				...points,
			];
		}
		return points;
	}, [activeField, originQuery, destinationQuery]);

	const handleSelectSuggestion = useCallback(
		(item: SuggestionItem) => {
			if (activeField === "origin") {
				const isCurrent = item.id === CURRENT_LOCATION;
				onSelectOrigin(item.name, isCurrent);
				setOriginQuery("");
			} else {
				onSelectDestination(item.name);
				setDestinationQuery("");
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
				<Pressable
					onPress={() => handleSelectSuggestion(item)}
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
							color={
								isCurrent ? "--primary" : "--muted-foreground"
							}
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
		},
		[activeField, origin, destination, handleSelectSuggestion],
	);

	const originDisplayValue =
		activeField === "origin" ? originQuery : (origin?.name ?? "");

	const destinationDisplayValue =
		activeField === "destination"
			? destinationQuery
			: (destination?.name ?? "");

	return (
		<View className={cn("flex-1", className)}>
			{/* AddressRoute com inputs */}
			<View className="flex-row gap-3">
				{/* Marcadores + linha */}
				<View className="items-center pt-3 pb-3" style={{ width: 20 }}>
					<FromMarker width={20} height={20} fill={primaryColor} />
					<View className="flex-1 w-0.5 bg-primary my-1" />
					<ToMarker width={20} height={20} fill={primaryColor} />
				</View>

				{/* Campos */}
				<View className="flex-1 gap-2">
					{/* Origem */}
					<Pressable
						onPress={() => activateField("origin")}
						className={cn(
							"flex-row items-center h-11 rounded-md border px-3 gap-2",
							activeField === "origin"
								? "border-primary bg-muted/40"
								: "border-border bg-muted/20",
						)}
					>
						{activeField === "origin" ? (
							<>
								<TextInput
									ref={originInputRef}
									value={originQuery}
									onChangeText={setOriginQuery}
									placeholder="Buscar origem..."
									placeholderTextColor="hsl(var(--muted-foreground) / 0.5)"
									className="flex-1 text-sm text-foreground"
									returnKeyType="search"
								/>
								{originQuery.length > 0 && (
									<Pressable
										onPress={() => setOriginQuery("")}
										hitSlop={8}
									>
										<Icon
											icon={X}
											size={16}
											color="--muted-foreground"
										/>
									</Pressable>
								)}
							</>
						) : (
							<Text
								className={cn(
									"flex-1 text-sm",
									origin?.name
										? "text-foreground"
										: "text-muted-foreground/60",
								)}
								numberOfLines={1}
							>
								{origin?.name ?? "Selecionar origem"}
							</Text>
						)}
					</Pressable>

					{/* Destino */}
					<Pressable
						onPress={() => activateField("destination")}
						className={cn(
							"flex-row items-center h-11 rounded-md border px-3 gap-2",
							activeField === "destination"
								? "border-primary bg-muted/40"
								: "border-border bg-muted/20",
						)}
					>
						{activeField === "destination" ? (
							<>
								<TextInput
									ref={destinationInputRef}
									value={destinationQuery}
									onChangeText={setDestinationQuery}
									placeholder="Buscar destino..."
									placeholderTextColor="hsl(var(--muted-foreground) / 0.5)"
									className="flex-1 text-sm text-foreground"
									returnKeyType="search"
								/>
								{destinationQuery.length > 0 && (
									<Pressable
										onPress={() => setDestinationQuery("")}
										hitSlop={8}
									>
										<Icon
											icon={X}
											size={16}
											color="--muted-foreground"
										/>
									</Pressable>
								)}
							</>
						) : (
							<Text
								className={cn(
									"flex-1 text-sm",
									destination?.name
										? "text-foreground"
										: "text-muted-foreground/60",
								)}
								numberOfLines={1}
							>
								{destination?.name ?? "Selecionar destino"}
							</Text>
						)}
					</Pressable>
				</View>
			</View>

			{/* Lista de sugestões */}
			{activeField !== null && (
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
			)}
		</View>
	);
}

export { AddressRouteInput };
