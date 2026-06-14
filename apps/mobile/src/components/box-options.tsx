import { disabilityTypeValues } from "@mobiliza/contracts";

import { Accessibility, Ear, Ellipsis, Eye } from "lucide-react-native";
import type React from "react";
import { Pressable, View } from "react-native";

import { Field } from "@/components/ui/field";
import { Text } from "@/components/ui/text";

import { cn } from "@/lib/utils";

import { Icon } from "./ui/icon";

type Option = {
	ids: string[];
	label: string;
	icon: React.ComponentType<{ size?: number; color?: string }>;
};

interface BoxOptionsProps {
	value?: string[];
	onChange: (nextValue: string[]) => void;
	error?: string | null;
	options?: Option[];
	maxSelections?: number;
}

const DEFAULT_OPTIONS: Option[] = [
	{
		ids: [disabilityTypeValues[0]],
		label: "Deficiência física ou\nmobilidade reduzida",
		icon: Accessibility,
	},
	{
		ids: [disabilityTypeValues[4]],
		label: "Deficiência auditiva",
		icon: Ear,
	},
	{
		ids: [disabilityTypeValues[2]],
		label: "Cegueira ou\nbaixa visão",
		icon: Eye,
	},
	{ ids: [disabilityTypeValues[7]], label: "Outro tipo", icon: Ellipsis },
];

export function BoxOptions({
	value,
	onChange,
	error,
	options = DEFAULT_OPTIONS,
	maxSelections,
}: BoxOptionsProps) {
	const selectedIds = value ?? [];

	return (
		<Field error={error}>
			<View className="flex-row flex-wrap justify-between">
				{options.map((option) => {
					const allSelected = option.ids.every((id) =>
						selectedIds.includes(id),
					);

					return (
						<Pressable
							key={option.ids.join("-")}
							onPress={() => {
								const nextValue = allSelected
									? selectedIds.filter(
											(item) =>
												!option.ids.includes(item),
										)
									: maxSelections !== undefined &&
											selectedIds.length +
												option.ids.length >
												maxSelections
										? [
												...selectedIds.slice(
													option.ids.length,
												),
												...option.ids,
											]
										: [...selectedIds, ...option.ids];

								onChange(nextValue);
							}}
							accessibilityRole="checkbox"
							accessibilityState={{ checked: allSelected }}
							style={({ pressed }) => pressed && { opacity: 0.8 }}
							className={cn(
								"mb-4 min-h-[120px] w-[48%] items-center justify-center rounded-xl border-2 p-4 border-border bg-background active:bg-accent/25 transition-colors",
								{
									"border-primary bg-primary": allSelected,
								},
							)}
						>
							<Icon
								icon={option.icon}
								size={32}
								color={
									allSelected
										? "--primary-foreground"
										: "--foreground"
								}
							/>
							<Text
								className={cn(
									"mt-3 text-center text-sm font-medium text-foreground",
									{
										"text-primary-foreground": allSelected,
									},
								)}
							>
								{option.label}
							</Text>
						</Pressable>
					);
				})}
			</View>
		</Field>
	);
}

export default BoxOptions;
