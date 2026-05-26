import { View } from "react-native";

import { Text } from "../ui/text";

interface Props {
	scholar: {
		latitude: number;
		longitude: number;
	};
}

export default function MapView({ scholar }: Props) {
	return (
		<View className="flex-1 items-center justify-center">
			<Text>Ainda não implementado</Text>
		</View>
	);
}
