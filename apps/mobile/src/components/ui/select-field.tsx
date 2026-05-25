import { ChevronDown } from "lucide-react-native";
import { View } from "react-native";

import { cn } from "@/lib/utils";

import type { SelectOption } from "@/types";

import { Button } from "./button";
import { Field } from "./field";
import { Icon } from "./icon";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetItem,
	SheetTitle,
	SheetTrigger,
} from "./select-sheet";
import { Text } from "./text";

interface SelectFieldProps {
	label: string;
	value: string;
	placeholder: string;
	options: SelectOption[];
	onValueChange: (value: string) => void;
	description?: string;
	error?: string;
}

function SelectField({
	label,
	value,
	placeholder,
	options,
	onValueChange,
	description,
	error,
}: SelectFieldProps) {
	return (
		<Field label={label} description={description} error={error}>
			<Sheet closeOnSelect>
				<SheetTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							"w-full justify-between px-3 py-1",
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
							{value || placeholder}
						</Text>
						<Icon icon={ChevronDown} size={20} color="foreground" />
					</Button>
				</SheetTrigger>

				<SheetContent enableDynamicSizing>
					<SheetHeader>
						<SheetTitle>{label}</SheetTitle>
						{description ? (
							<SheetDescription>{description}</SheetDescription>
						) : null}
					</SheetHeader>

					<View className="pt-4 pb-2">
						{options.map((option) => (
							<SheetItem
								key={option.value}
								label={option.label}
								selected={value === option.value}
								onPress={() => onValueChange(option.value)}
							/>
						))}
					</View>
				</SheetContent>
			</Sheet>
		</Field>
	);
}

export { SelectField };
