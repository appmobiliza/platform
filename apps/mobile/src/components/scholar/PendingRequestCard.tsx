import { View } from "react-native";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withSequence,
	withTiming,
	Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Info } from "lucide-react-native";

interface PendingRequestCardProps {
	onAccept: () => void;
	onReject: () => void;
}

export function PendingRequestCard({ onAccept, onReject }: PendingRequestCardProps) {
	// Reanimated shared value for opacity pulsing
	const opacity = useSharedValue(0.4);

	useEffect(() => {
		// Pulse between 0.4 and 1.0 continuously
		opacity.value = withRepeat(
			withSequence(
				withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
				withTiming(0.4, { duration: 1000, easing: Easing.inOut(Easing.ease) })
			),
			-1, // Infinite
			true // Reverse
		);
	}, []);

	const animatedStyle = useAnimatedStyle(() => {
		return {
			opacity: opacity.value,
			borderColor: "#EAB308", // Amber-500
			borderWidth: 2,
		};
	});

	return (
		<View className="mb-8">
			{/* "Glow" Layer */}
			<Animated.View 
				className="absolute inset-0 rounded-[24px]"
				style={[animatedStyle]} 
			/>
			
			{/* Card Content Layer */}
			<View className="bg-card rounded-[24px] p-5 border border-border">
				{/* Header */}
				<View className="flex-row items-start justify-between mb-6">
					<View className="flex-row items-center">
						<Avatar alt="Maria Aparecida's Avatar" className="h-12 w-12 mr-3 bg-[#E6F4F5]">
							<AvatarFallback>
								<Text className="text-[#005E65] font-bold">MA</Text>
							</AvatarFallback>
						</Avatar>
						<View>
							<Text className="font-bold text-base text-foreground">Maria Aparecida</Text>
							<Text className="text-sm text-muted-foreground">Deficiência visual</Text>
						</View>
					</View>
					<Text className="text-[#EAB308] text-xs font-semibold mt-1">
						● há 2 min
					</Text>
				</View>

				{/* Route */}
				<View className="mb-6">
					<View className="flex-row items-center mb-1">
						<View className="w-4 h-4 rounded-full bg-info items-center justify-center mr-3 ml-0.5">
							<View className="w-1.5 h-1.5 bg-white rounded-full" />
						</View>
						<Text className="text-foreground font-medium flex-1">
							Instituto de Computação
						</Text>
					</View>

					{/* Vertical Line */}
					<View className="w-0.5 h-6 bg-border ml-2 mb-1" />

					<View className="flex-row items-center">
						<View className="w-5 h-5 rounded-full bg-primary items-center justify-center mr-2">
							<View className="w-2 h-2 bg-white rounded-full" />
						</View>
						<Text className="text-foreground font-medium flex-1">
							Biblioteca Central
						</Text>
					</View>
				</View>

				{/* Observation */}
				<View className="bg-secondary rounded-xl p-3 flex-row items-start mb-6">
					<Info size={16} className="text-muted-foreground mt-0.5 mr-2" />
					<Text className="text-muted-foreground text-sm flex-1 leading-snug">
						Prefere áudio descrição contínua durante todo o percurso
					</Text>
				</View>

				{/* Actions */}
				<View className="flex-row gap-3">
					<Button 
						variant="outline" 
						onPress={onReject}
						className="flex-1 rounded-xl h-12 bg-transparent border-border"
					>
						<Text className="font-semibold text-foreground">Recusar</Text>
					</Button>
					<Button 
						onPress={onAccept}
						className="flex-[1.5] rounded-xl h-12 bg-info hover:bg-info/90"
					>
						<Text className="font-semibold text-white">Aceitar atendimento</Text>
					</Button>
				</View>
			</View>
		</View>
	);
}
