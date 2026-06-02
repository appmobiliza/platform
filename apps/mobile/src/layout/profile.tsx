import { ScrollView, View } from "react-native";

import { Header } from "@/components/header";

interface Props {
	title: string;
	description: string;
	children: React.ReactNode;
}

export default function ProfileLayout({ title, description, children }: Props) {
	return (
		<View className="flex-1">
			<Header title={title} description={description} />

			<ScrollView
				className="flex-1"
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={{
					paddingHorizontal: 16,
					paddingTop: 24,
					paddingBottom: 32,
				}}
			>
				{children}
			</ScrollView>
		</View>
	);
}
