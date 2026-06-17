import { useNavigation } from "expo-router";
import { useEffect, useRef } from "react";
import { ScrollView, View } from "react-native";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { toast } from "@/components/ui/toast";

import { useLightStatusBar } from "@/hooks/use-light-status-bar";

interface Props {
	title: string;
	description: string;
	children: React.ReactNode;
	handleSave?: () => void;
	isDirty?: boolean;
	isSaving?: boolean;
}

export default function ProfileLayout({
	title,
	description,
	children,
	handleSave,
	isSaving,
	isDirty,
}: Props) {
	const navigation = useNavigation();
	const exitConfirmedRef = useRef(false);

	useLightStatusBar();

	useEffect(() => {
		const unsubscribe = navigation.addListener("beforeRemove", (e) => {
			if (exitConfirmedRef.current) {
				exitConfirmedRef.current = false;
				return;
			}

			if (isSaving || isDirty) {
				e.preventDefault();

				toast.warning("Você possui alterações não salvas", {
					description:
						"Tem certeza de que deseja sair sem salvar suas alterações?",
					duration: Infinity,
					id: "exit-confirmation",
					action: {
						label: "Sair sem salvar",
						onClick: () => {
							exitConfirmedRef.current = true;
							navigation.dispatch(e.data.action);
						},
					},
					cancel: {
						label: "Cancelar",
						onClick: () => {},
					},
				});
			}
		});

		return unsubscribe;
	}, [navigation, isSaving, isDirty]);

	return (
		<View className="flex-1">
			<Header
				title={title}
				description={description}
				isDisabled={isSaving}
			/>

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
					<Button
						className="mt-8"
						onPress={handleSave}
						disabled={isSaving || !isDirty}
					>
						<Text>
							{isSaving ? "Salvando..." : "Salvar alterações"}
						</Text>
					</Button>
				)}
			</ScrollView>
		</View>
	);
}
