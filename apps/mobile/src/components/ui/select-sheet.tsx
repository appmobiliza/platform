import { useState } from "react";

import { BottomSheet, Button, Column, Host, Text } from "@expo/ui";

export default function SelectSheet() {
	const [isPresented, setIsPresented] = useState(false);

	return (
		<Host style={{ flex: 1 }}>
			<Button label="Open sheet" onPress={() => setIsPresented(true)} />
			<BottomSheet
				isPresented={isPresented}
				onDismiss={() => setIsPresented(false)}
			>
				<Column spacing={12}>
					<Text textStyle={{ fontSize: 18, fontWeight: "700" }}>
						Sheet contents
					</Text>
					<Text>Drag down or tap the overlay to dismiss.</Text>
					<Button
						label="Close"
						onPress={() => setIsPresented(false)}
					/>
				</Column>
			</BottomSheet>
		</Host>
	);
}
