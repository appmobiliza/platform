"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type DayToggleGroupProps = {
	defaultValue: string[];
};

function DayToggleGroup({ defaultValue }: DayToggleGroupProps) {
	const days: Array<[string, string]> = [
		["seg", "Seg"],
		["ter", "Ter"],
		["qua", "Qua"],
		["qui", "Qui"],
		["sex", "Sex"],
		["sab", "Sáb"],
		["dom", "Dom"],
	];

	return (
		<ToggleGroup
			type="multiple"
			defaultValue={defaultValue}
			variant="outline"
			spacing={2}
			className="flex w-full flex-wrap justify-start gap-2.5"
		>
			{days.map(([value, label]) => (
				<ToggleGroupItem
					key={value}
					value={value}
					aria-label={label}
					className="h-9 min-w-9 rounded-full px-0 text-xs"
				>
					{label}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}

export { DayToggleGroup };
