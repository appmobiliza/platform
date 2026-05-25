import { View } from "react-native";

import { Text } from "@/components/ui/text";

interface FieldProps {
	label: string;
	children: React.ReactNode;
}

function Field({ label, children }: FieldProps) {
	return (
		<View className="flex flex-col items-start gap-1">
			<Text className="text-sm font-medium text-foreground">{label}</Text>
			{children}
		</View>
	);
}

export { Field };
