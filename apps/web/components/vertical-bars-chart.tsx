"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

import { cn } from "@/lib/utils";

export const description = "A horizontal bar chart";

type ChartData = {
	label: string;
	value: number;
};

interface Props {
	data: ChartData[];
	config: ChartConfig;
	className?: string;
}

export function VerticalBarsChart({ data, config, className }: Props) {
	return (
		<ChartContainer
			config={config}
			className={cn("h-full min-h-0 w-full aspect-auto", className)}
		>
			<BarChart accessibilityLayer data={data}>
				<CartesianGrid vertical={false} />
				<XAxis
					dataKey="label"
					tickLine={false}
					tickMargin={10}
					axisLine={false}
					tickFormatter={(value) => value.slice(0, 3)}
				/>
				<ChartTooltip
					cursor={false}
					content={<ChartTooltipContent hideLabel />}
				/>
				<Bar dataKey="value" fill="var(--color-value)" radius={8} />
			</BarChart>
		</ChartContainer>
	);
}
