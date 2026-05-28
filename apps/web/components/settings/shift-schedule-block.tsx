"use client";

import { DayToggleGroup } from "@/components/settings/day-toggle-group";
import { Input } from "@/components/ui/input";

import { Field, FieldLabel } from "../ui/field";

type ShiftScheduleBlockProps = {
	start: string;
	end: string;
	days: string[];
};

function TimeRangeField({
	label,
	defaultValue,
}: {
	label: string;
	defaultValue: string;
}) {
	return (
		<Field orientation="horizontal" className="w-full">
			<FieldLabel className="whitespace-nowrap text-sm text-foreground">
				{label}
			</FieldLabel>
			<Input
				readOnly
				defaultValue={defaultValue}
				className="w-full text-center px-3 text-base text-foreground shadow-none"
			/>
		</Field>
	);
}

function ShiftScheduleBlock({ start, end, days }: ShiftScheduleBlockProps) {
	return (
		<div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
			<div className="space-y-3">
				<p className="text-sm font-medium text-foreground">
					Intervalo de horário
				</p>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
					<TimeRangeField label="Início" defaultValue={start} />
					<TimeRangeField label="até" defaultValue={end} />
				</div>
			</div>
			<div className="space-y-3">
				<p className="text-sm font-medium text-foreground">
					Dias ativos
				</p>
				<DayToggleGroup defaultValue={days} />
			</div>
		</div>
	);
}

export { ShiftScheduleBlock };
