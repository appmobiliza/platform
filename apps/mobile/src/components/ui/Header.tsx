import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
	title?: string;
	onBack?: () => void;
	showBack?: boolean;
}

export function Header({ title, onBack, showBack = true }: HeaderProps) {
	const router = useRouter();

	const handleBack = () => {
		if (onBack) {
			onBack();
		} else {
			router.back();
		}
	};

	return (
		<View className="flex-row items-center pt-12 pb-4 px-6 bg-white">
			{showBack && (
				<TouchableOpacity
					onPress={handleBack}
					className="mr-4 p-2 -ml-2"
					activeOpacity={0.7}
				>
					<ArrowLeft size={24} color="#171717" />
				</TouchableOpacity>
			)}
			{title && (
				<Text className="text-xl font-bold text-neutral-900">
					{title}
				</Text>
			)}
		</View>
	);
}
