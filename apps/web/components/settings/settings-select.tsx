"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";

type SettingsSelectProps = {
	value: string;
	items: string[];
	triggerClassName?: string;
};

function SettingsSelect({
	value,
	items,
	triggerClassName,
}: SettingsSelectProps) {
	return (
		<Select defaultValue={value}>
			<SelectTrigger
				className={cn(
					"h-9 w-full bg-background shadow-none",
					triggerClassName,
				)}
			>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{items.map((item) => (
					<SelectItem key={item} value={item}>
						{item}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

export { SettingsSelect };
