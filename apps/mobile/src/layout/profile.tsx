import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";

import { ExitConfirmDialog } from "@/components/exit-confirm-dialog";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

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
	const [showExitDialog, setShowExitDialog] = useState(false);
	const [pendingAction, setPendingAction] = useState<{
		type: string;
		payload?: object;
	} | null>(null);

	useLightStatusBar();

	useEffect(() => {
		const unsubscribe = navigation.addListener("beforeRemove", (e) => {
			if (isSaving || isDirty) {
				e.preventDefault();
				setPendingAction(e.data.action);
				setShowExitDialog(true);
			}
		});

		return unsubscribe;
	}, [navigation, isSaving, isDirty]);

	const handleConfirmExit = () => {
		setShowExitDialog(false);
		if (pendingAction) {
			navigation.dispatch(pendingAction);
		}
		setPendingAction(null);
	};

	const handleCancelExit = () => {
		setShowExitDialog(false);
		setPendingAction(null);
	};

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
						disabled={isSaving}
					>
						<Text>
							{isSaving ? "Salvando..." : "Salvar alterações"}
						</Text>
					</Button>
				)}
			</ScrollView>

			<ExitConfirmDialog
				open={showExitDialog}
				onOpenChange={setShowExitDialog}
				onConfirm={handleConfirmExit}
				onCancel={handleCancelExit}
			/>
		</View>
	);
}
