import { useMemo, useState } from "react";

import { MapPin, Search } from "lucide-react-native";
import { TextInput, TouchableOpacity, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { cn } from "@/lib/utils";

import { ufalPoints } from "@/constants/locations";

interface DestinationSelectorProps {
	selectedDestination?: string;
	onSelectDestination: (name: string) => void;
	className?: string;
}

function DestinationSelector({
	selectedDestination,
	onSelectDestination,
	className,
}: DestinationSelectorProps) {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredLocations = useMemo(() => {
		if (!searchQuery.trim()) {
			return [];
		}

		const query = searchQuery.toLowerCase().trim();
		return ufalPoints.filter(
			(point) =>
				point.name.toLowerCase().includes(query) ||
				(point.abbrev?.toLowerCase().includes(query) ?? false),
		);
	}, [searchQuery]);

	return (
		<View className={cn("gap-4", className)}>
			<View className="relative">
				<TextInput
					placeholder="Buscar local..."
					value={searchQuery}
					onChangeText={setSearchQuery}
					className="dark:bg-input/50 border-border dark:border-input bg-background text-foreground flex h-11 w-full min-w-0 flex-row items-center rounded-md border py-1 pl-10 pr-3 text-base leading-5 shadow-sm shadow-black/5 placeholder:text-muted-foreground/50"
					placeholderTextColor="hsl(var(--muted-foreground) / 0.5)"
				/>
				<View className="absolute left-3 top-1/2 -translate-y-1/2">
					<Icon icon={Search} size={20} color="--muted-foreground" />
				</View>
			</View>

			{!searchQuery.trim() ? (
				<Text className="py-4 text-center text-muted-foreground">
					Digite para buscar locais no campus
				</Text>
			) : filteredLocations.length === 0 ? (
				<Text className="py-4 text-center text-muted-foreground">
					Nenhum local encontrado
				</Text>
			) : (
				<View className="gap-2">
					{filteredLocations.map((point) => (
						<TouchableOpacity
							key={point.name}
							activeOpacity={0.7}
							onPress={() => onSelectDestination(point.name)}
							className={cn(
								"flex-row items-center gap-4 rounded-lg p-3",
								selectedDestination === point.name
									? "bg-input"
									: "border-border bg-card border",
							)}
						>
							<View className="w-12 items-center justify-center rounded-md bg-primary p-2">
								<Icon
									icon={MapPin}
									size={18}
									color="--foreground"
								/>
							</View>
							<View className="flex-1">
								<Text
									className="text-base font-bold"
									numberOfLines={1}
								>
									{point.name}
								</Text>
								{point.abbrev && (
									<Text
										className="mt-0.5 text-xs"
										numberOfLines={1}
									>
										{point.abbrev}
									</Text>
								)}
							</View>
						</TouchableOpacity>
					))}
				</View>
			)}
		</View>
	);
}

export { DestinationSelector };
