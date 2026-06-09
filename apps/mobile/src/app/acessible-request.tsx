import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { AcessibleRequestStep } from "@/components/simplified-interface/request-flow";

export default function AccessibleRequest() {
	const insets = useSafeAreaInsets();

	const [currentStep, setCurrentStep] = useState<AcessibleRequestStep>(Step1);

	return (
		<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
			<View
				className="bg-primary pb-16 px-4 flex justify-center items-center mb-8"
				style={{
					paddingTop: insets.top + 64,
				}}
			>
				<FlowStep {...currentStep} />
			</View>
		</ScrollView>
	);
}
