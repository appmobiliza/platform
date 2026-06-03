import {
	BottomSheetFlatList,
	type BottomSheetFlatListMethods,
	BottomSheetScrollView,
	BottomSheetTextInput,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import { ChevronDown } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { type FlatList, InteractionManager, View } from "react-native";

import { cn } from "@/lib/utils";

import type { SelectOption } from "@/types";
import { Button } from "./button";
import { Field } from "./field";
import { Icon } from "./icon";
import { Input, inputClassName, inputNativeClassName } from "./input";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetItem,
	SheetTitle,
	SheetTrigger,
} from "./sheet";
import { Text } from "./text";

interface SelectFieldProps {
	label: string;
	value: string;
	placeholder: string;
	options: SelectOption[];
	onValueChange: (value: string) => void;
	description?: string;
	error?: string;
	searchable?: boolean;
}

const ITEM_HEIGHT = 54;

function SelectField({
	label,
	value,
	placeholder,
	options,
	onValueChange,
	description,
	error,
	searchable = false,
}: SelectFieldProps) {
	const [searchQuery, setSearchQuery] = useState("");

	const selectedLabel = options.find((o) => o.value === value)?.label;

	const filteredOptions = useMemo(() => {
		if (!searchable || !searchQuery.trim()) {
			return options;
		}

		const query = searchQuery.toLowerCase().trim();
		return options.filter(
			(option) =>
				option.label.toLowerCase().includes(query) ||
				option.value.toLowerCase().includes(query),
		);
	}, [options, searchable, searchQuery]);

	const selectedIndex = filteredOptions.findIndex((o) => o.value === value);

	const handleSearchReset = () => {
		setSearchQuery("");
	};

	const listRef = useRef<BottomSheetFlatListMethods>(null);

	const handleSheetChange = (index: number) => {
		if (index < 0) return;

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				listRef.current?.scrollToIndex({
					index: selectedIndex,
					viewPosition: 0.5,
					animated: false,
				});
			});
		});
	};

	return (
		<Field label={label} description={description} error={error}>
			<Sheet closeOnSelect>
				<SheetTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							"w-full justify-between px-3 py-1 text-foreground",
							error && "border-destructive",
						)}
						accessibilityLabel={label}
						accessibilityHint={description}
						aria-invalid={Boolean(error)}
						accessibilityState={{ invalid: Boolean(error) }}
					>
						<Text
							className={cn(
								"flex-1 text-left",
								value
									? "text-foreground"
									: "text-muted-foreground",
							)}
						>
							{selectedLabel || placeholder}
						</Text>
						<Icon
							icon={ChevronDown}
							size={20}
							color="--foreground"
						/>
					</Button>
				</SheetTrigger>

				<SheetContent
					onChange={handleSheetChange}
					enableDynamicSizing={!searchable}
					wrapWithView={!searchable}
					snapPoints={searchable ? ["50%"] : undefined}
					panDownToClose
				>
					<SheetHeader className="pb-0">
						<SheetTitle>{label}</SheetTitle>
						{description ? (
							<SheetDescription>{description}</SheetDescription>
						) : null}
					</SheetHeader>

					{searchable ? (
						<View className="px-4 pt-3 pb-3 border-b border-border">
							<BottomSheetTextInput
								placeholder="Pesquisar"
								value={searchQuery}
								onChangeText={setSearchQuery}
								className={cn(
									inputClassName,
									inputNativeClassName,
								)}
								aria-label="Pesquisar opções"
							/>
						</View>
					) : null}

					{searchable ? (
						<BottomSheetFlatList
							ref={listRef}
							data={filteredOptions}
							contentContainerClassName="pb-4"
							keyExtractor={(item) => item.value}
							initialScrollIndex={Math.max(0, selectedIndex)}
							getItemLayout={(_, index) => ({
								length: ITEM_HEIGHT,
								offset: ITEM_HEIGHT * index,
								index,
							})}
							renderItem={({ item: option }) => (
								<SheetItem
									label={option.label}
									selected={value === option.value}
									onPress={() => {
										onValueChange(option.value);
										handleSearchReset();
									}}
								/>
							)}
							showsVerticalScrollIndicator={false}
						/>
					) : (
						<View className="pt-2 pb-4">
							{filteredOptions.map((option) => (
								<SheetItem
									key={option.value}
									label={option.label}
									selected={value === option.value}
									onPress={() => {
										onValueChange(option.value);
										handleSearchReset();
									}}
								/>
							))}
						</View>
					)}
				</SheetContent>
			</Sheet>
		</Field>
	);
}

export { SelectField };
