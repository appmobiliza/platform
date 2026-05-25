import { Text, View } from "react-native";

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
		<View
			className="flex-row w-full justify-between mt-4"
			accessibilityLabel={`Passo ${currentIndex + 1} de ${steps.length}`}
		>
			{steps.map((step, index) => {
				const isActive = index === currentIndex;
				return (
					<View key={step.id} className="flex-1 items-center">
						<Text
							accessibilityLabel={`${step.title}, passo ${index + 1} de ${steps.length}`}
							className={[
								"text-sm font-semibold mb-2",
								isActive
									? "text-brand-primary"
									: "text-muted-foreground",
							]
								.filter(Boolean)
								.join(" ")}
						>
							{step.title}
						</Text>
						<View
							className={[
								"h-1 w-full rounded-full",
								isActive
									? "bg-brand-primary"
									: "bg-neutral-200",
							]
								.filter(Boolean)
								.join(" ")}
						/>
					</View>
				);
			})}
		</View>
	);
}
