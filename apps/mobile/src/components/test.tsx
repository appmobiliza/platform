import { useRef } from "react";

import {
	BottomSheetModal,
	BottomSheetView,
} from "@expo/ui/community/bottom-sheet";
import { Button, Text, View } from "react-native";

export default function BottomSheetModalExample() {
	const modalRef = useRef<BottomSheetModal>(null);

	return (
		<View style={{ flex: 1 }}>
			<Button
				title="Present"
				onPress={() => modalRef.current?.present()}
			/>

			<BottomSheetModal
				ref={modalRef}
				snapPoints={["50%", "90%"]}
				enablePanDownToClose
			>
				<BottomSheetView style={{ padding: 24 }}>
					<Text>Modal content</Text>
					<Button
						title="Dismiss"
						onPress={() => modalRef.current?.dismiss()}
					/>
				</BottomSheetView>
			</BottomSheetModal>
		</View>
	);
}
