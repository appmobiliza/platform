import { View } from "react-native";

import { Text } from "@/components/ui/text";

export function StatCard({ title, value }: { title: string; value: string }) {
	return (
		<View className="bg-card p-4 border border-border rounded-lg flex-1 w-full items-center justify-center">
			<Text className="text-muted-foreground font-semibold text-xs mb-3 tracking-widest">
				{title}
			</Text>
			<Text className="text-foreground font-semibold leading-relaxed">
				{value}
			</Text>
		</View>
	);
}
