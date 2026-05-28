import { Field, FieldLabel } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";

import { cn } from "@/lib/utils";

interface ProgressWithLabelProps {
	value: number;
	percentage: number;
	showPercentage?: boolean;
	label: string;
	variant?: "horizontal" | "vertical";
}

export function ProgressWithLabel({
	value,
	percentage,
	showPercentage,
	label,
	variant = "horizontal",
}: ProgressWithLabelProps) {
	return (
		<Field
			className={cn("w-full flex gap-2", {
				"flex-row items-center": variant === "horizontal",
				"flex-col": variant === "vertical",
			})}
		>
			<FieldLabel htmlFor="progress-upload">
				<span>{label}</span>
			</FieldLabel>
			<div className="flex flex-row items-center gap-2">
				<Progress className="w-full flex-1" value={percentage} />
				<span className="text-sm font-medium w-6 text-right">
					{value ?? `${percentage}%`}
					{showPercentage !== undefined && `⋅ ${percentage}%`}
				</span>
			</div>
		</Field>
	);
}
