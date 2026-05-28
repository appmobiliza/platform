"use client";

import * as React from "react";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";

export function DatePickerWithRange({ className }: { className?: string }) {
	const currentDate = new Date();

	const [date, setDate] = React.useState<DateRange | undefined>({
		from: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
		to: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
	});

	const isFullMonthRange = (from?: Date, to?: Date) => {
		if (!from || !to) return false;
		const startOfMonth = new Date(from.getFullYear(), from.getMonth(), 1);
		const endOfMonth = new Date(from.getFullYear(), from.getMonth() + 1, 0);
		return (
			from.getFullYear() === to.getFullYear() &&
			from.getMonth() === to.getMonth() &&
			from.getDate() === startOfMonth.getDate() &&
			to.getDate() === endOfMonth.getDate()
		);
	};

	const capitalize = (s: string) => {
		if (!s) return s;
		return s.charAt(0).toUpperCase() + s.slice(1);
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					id="date-picker-range"
					className={cn(
						"justify-start px-2.5 font-normal",
						className,
					)}
					size={"lg"}
				>
					<CalendarIcon />
					{date?.from ? (
						date.to ? (
							isFullMonthRange(date.from, date.to) ? (
								capitalize(
									format(date.from, "LLLL yyyy", {
										locale: ptBR,
									}),
								)
							) : (
								<>
									{format(date.from, "LLL dd, y", {
										locale: ptBR,
									})}{" "}
									-{" "}
									{format(date.to, "LLL dd, y", {
										locale: ptBR,
									})}
								</>
							)
						) : (
							format(date.from, "LLL dd, y", { locale: ptBR })
						)
					) : (
						<span>Selecione uma data</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="range"
					defaultMonth={date?.from}
					selected={date}
					onSelect={setDate}
					numberOfMonths={2}
					locale={ptBR}
				/>
			</PopoverContent>
		</Popover>
	);
}
