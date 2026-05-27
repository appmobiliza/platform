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
				<span className="ml-auto">
					{value ?? `${percentage}%`}
					{showPercentage !== undefined && `⋅ ${percentage}%`}
				</span>
			</FieldLabel>
			<Progress value={percentage} id="progress-upload" />
		</Field>
	);
}
