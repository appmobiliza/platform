import { ScrollView, View } from "react-native";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { useLightStatusBar } from "@/hooks/use-light-status-bar";

interface Props {
	title: string;
	description: string;
	children: React.ReactNode;
	handleSave?: () => void;
}

export default function ProfileLayout({
	title,
	description,
	children,
	handleSave,
}: Props) {
	useLightStatusBar();
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

				{handleSave && (
					<Button className="mt-8" onPress={handleSave}>
						<Text>Salvar alterações</Text>
					</Button>
				)}
			</ScrollView>
		</View>
	);
}
