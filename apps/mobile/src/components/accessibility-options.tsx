import type React from "react";

import { Accessibility, Ear, Ellipsis, Eye } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Field } from "@/components/ui/field";
import { Text } from "@/components/ui/text";

import { cn } from "@/lib/utils";

import { Icon } from "./ui/icon";

type Option = {
	id: string;
	label: string;
	icon: React.ComponentType<{ size?: number; color?: string }>;
};

interface AccessibilityOptionsProps {
	value?: string[];
	onChange: (nextValue: string[]) => void;
	error?: string | null;
	options?: Option[];
}

const DEFAULT_OPTIONS: Option[] = [
	{
		id: "physical",
		label: "Deficiência física ou\nmobilidade reduzida",
		icon: Accessibility,
	},
	{ id: "hearing", label: "Deficiência auditiva", icon: Ear },
	{ id: "visual", label: "Cegueira ou\nbaixa visão", icon: Eye },
	{ id: "other", label: "Outro tipo", icon: Ellipsis },
];

export function AccessibilityOptions({
	value,
	onChange,
	error,
	options = DEFAULT_OPTIONS,
}: AccessibilityOptionsProps) {
	const selectedIds = value ?? [];

	return (
		<Field error={error}>
			<View className="flex-row flex-wrap justify-between">
				{options.map((option) => {
					const isSelected = selectedIds.includes(option.id);

					return (
						<Pressable
							key={option.id}
							onPress={() => {
								const nextValue = isSelected
									? selectedIds.filter(
											(item) => item !== option.id,
										)
									: [...selectedIds, option.id];

								onChange(nextValue);
							}}
							accessibilityRole="checkbox"
							accessibilityState={{ checked: isSelected }}
							style={({ pressed }) => pressed && { opacity: 0.8 }}
							className={cn(
								"mb-4 min-h-[120px] w-[48%] items-center justify-center rounded-xl border-2 p-4 border-border bg-background",
								{
									"border-primary bg-primary": isSelected,
								},
							)}
						>
							<Icon
								icon={option.icon}
								size={32}
								color={
									isSelected
										? "--primary-foreground"
										: "--foreground"
								}
							/>
							<Text
								className={cn(
									"mt-3 text-center text-sm font-medium text-foreground",
									{
										"text-primary-foreground": isSelected,
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

export default AccessibilityOptions;
