import { Text, View } from "react-native";

import { cn } from "@/lib/utils";

interface Step {
	id: string;
	title: string;
}

interface StepIndicatorProps {
	steps: Step[];
	currentStepId: string;
}

export function StepIndicator({ steps, currentStepId }: StepIndicatorProps) {
	const currentIndex = steps.findIndex((step) => step.id === currentStepId);

	return (
		<View className="flex-row w-full justify-between gap-2">
			{steps.map((step, index) => {
				const isActive = index === currentIndex;
				return (
					<View key={step.id} className="flex-1 items-center">
						<Text
							accessibilityLabel={`${step.title}, passo ${index + 1} de ${steps.length}`}
							className={cn(
								"text-sm font-semibold mb-2 text-muted-foreground",
								isActive &&
									"web:dark:brightness-150 text-primary",
							)}
						>
							{step.title}
						</Text>
						<View
							className={cn(
								"h-1 w-full rounded-full bg-muted-foreground",
								{
									"bg-primary web:dark:brightness-150":
										isActive,
								},
							)}
						/>
					</View>
				);
			})}
		</View>
	);
}
