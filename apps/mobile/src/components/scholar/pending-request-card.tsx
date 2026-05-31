import { useEffect } from "react";

import { Info } from "lucide-react-native";
import { View } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSequence,
	withTiming,
} from "react-native-reanimated";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { cn } from "@/lib/utils";

import { AddressRoute } from "../address";

export enum ServiceStatus {
	Pending = "pending",
	Concluded = "concluded",
}

export type Service = {
	id: string;
	student: {
		name: string;
		avatarUrl?: string;
		disability: string;
		observation: string;
	};
	route: {
		origin: string;
		destination: string;
	};
	status: ServiceStatus;
	startedAt?: Date;
	finishedAt?: Date;
};

interface PendingRequestCardProps {
	service: Service;
	onAccept: () => void;
	onReject: () => void;
}

export function PendingRequestCard({
	service,
	onAccept,
	onReject,
}: PendingRequestCardProps) {
	const opacity = useSharedValue(0.4);

	useEffect(() => {
		opacity.value = withRepeat(
			withSequence(
				withTiming(1, {
					duration: 1000,
					easing: Easing.inOut(Easing.ease),
				}),
				withTiming(0.4, {
					duration: 1000,
					easing: Easing.inOut(Easing.ease),
				}),
			),
			-1,
			true,
		);
	}, [opacity]);

	const animatedStyle = useAnimatedStyle(() => {
		return {
			opacity: opacity.value,
			borderColor: "#EAB308",
			borderWidth: 2,
		};
	});

	const currentDate = new Date();

	return (
		<View className="p-1">
			<Animated.View
				className="absolute inset-0 rounded-2xl"
				style={[animatedStyle]}
			/>

			<View className="border border-border bg-card p-5 gap-4 rounded-xl">
				<View className="flex-row items-start justify-between">
					<View className="flex-row items-center gap-3">
						<Avatar
							alt={`${service.student.name}'s Avatar`}
							className="h-12 w-12"
						>
							<AvatarFallback>
								<Text className="font-bold">
									{service.student.name
										.split(" ")
										.map((n) => n[0])
										.join("")
										.slice(0, 2)
										.toUpperCase()}
								</Text>
							</AvatarFallback>
						</Avatar>
						<View>
							<Text className="text-base font-bold text-foreground">
								{service.student.name}
							</Text>
							<Text className="text-sm text-muted-foreground">
								{service.student.disability}
							</Text>
						</View>
					</View>
					<Text
						className={cn("mt-1 text-xs font-semibold", {
							"text-[#1D9E75]":
								service.status === ServiceStatus.Concluded,
							"text-[#EAB308]":
								service.status === ServiceStatus.Pending,
						})}
					>
						{service.status === ServiceStatus.Concluded
							? "Concluído"
							: `há ${Math.floor((currentDate.getTime() - (service.startedAt?.getTime() ?? currentDate.getTime())) / 60000)} min`}
					</Text>
				</View>

				<AddressRoute
					from={{
						label: service.route.origin,
					}}
					to={{
						label: service.route.destination,
					}}
					shouldShowRoute
					size="lg"
				/>

				<View className="flex-row items-start rounded-sm bg-secondary p-3">
					<Info
						size={16}
						className="mr-2 mt-0.5 text-muted-foreground"
					/>
					<Text className="flex-1 text-sm leading-snug text-foreground">
						{service.student.observation}
					</Text>
				</View>

				<View className="flex-row gap-3">
					<Button
						variant="outline"
						onPress={onReject}
						className="px-6"
					>
						<Text className="font-semibold">Recusar</Text>
					</Button>
					<Button onPress={onAccept} className="flex-1">
						<Text className="font-semibold">
							Aceitar atendimento
						</Text>
					</Button>
				</View>
			</View>
		</View>
	);
}
