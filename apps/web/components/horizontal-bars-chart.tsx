"use client";

import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";

import { type ChartConfig, ChartContainer } from "@/components/ui/chart";

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

export function HorizontalBarsChart({ data, config, className }: Props) {
	return (
		<ChartContainer
			config={config}
			className={cn("h-full min-h-0 w-full aspect-auto", className)}
		>
			<BarChart
				accessibilityLayer
				data={data}
				layout="vertical"
				margin={{
					left: -10,
				}}
			>
				<XAxis type="number" dataKey="value" hide />
				<YAxis
					dataKey="label"
					type="category"
					tickLine={false}
					tickMargin={10}
					axisLine={false}
					tick={{
						className:
							"font-medium fill-foreground text-xs md:text-sm",
					}}
					tickFormatter={(value) => `${String(value).slice(0, 3)}h`}
				/>
				<Bar dataKey="value" fill="var(--color-value)" radius={5}>
					<LabelList dataKey="value" position="right" />
				</Bar>
			</BarChart>
		</ChartContainer>
	);
}
