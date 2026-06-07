import { Info } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
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
import { Icon } from "../ui/icon";

export enum ServiceStatus {
	Pending = "pending",
	During = "during",
	Concluded = "concluded",
}

export type Service = {
	id: string;
	student: {
		name: string;
		avatarUrl?: string;
		disability: string;
		observation?: string;
	};
	route: {
		origin: string;
		destination: string;
	};
	status: ServiceStatus;
	startedAt?: Date;
	finishedAt?: Date;
	createdAt?: Date;
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
	const [hasAccepted, setHasAccepted] = useState(false);
	const opacity = useSharedValue(0.4);

	useEffect(() => {
		opacity.set(() =>
			withRepeat(
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
			),
		);
	}, [opacity]);

	const animatedStyle = useAnimatedStyle(() => {
		return {
			opacity: opacity.value,
			borderColor: "#EAB308",
			borderWidth: 2,
		};
	});

	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const interval = setInterval(() => {
			setNow(new Date());
		}, 30_000);

		return () => clearInterval(interval);
	}, []);

	const elapsedMinutes = useMemo(() => {
		if (hasAccepted) return null;
		const refTime = service.createdAt ?? service.startedAt;
		if (!refTime) return 0;
		return Math.floor((now.getTime() - refTime.getTime()) / 60000);
	}, [hasAccepted, service.createdAt, service.startedAt, now]);

	return (
		<View className="p-1">
			{!hasAccepted && (
				<Animated.View
					className="absolute inset-0 rounded-2xl"
					style={[animatedStyle]}
				/>
			)}

			<View
				className={cn(
					"border border-border bg-card p-5 gap-4 rounded-xl",
					{
						"border-info-border border-2": hasAccepted,
					},
				)}
			>
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
							"text-warning-foreground":
								service.status === ServiceStatus.Pending,
							"text-info-foreground": hasAccepted,
						})}
					>
						{hasAccepted
							? "Em andamento"
							: `há ${elapsedMinutes ?? 0} min`}
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

				{service.student.observation && (
					<View className="flex-row items-start rounded-sm bg-secondary p-3">
						<Icon icon={Info} size={16} color="--foreground" />
						<Text className="flex-1 text-sm leading-snug text-foreground ml-2">
							{service.student.observation}
						</Text>
					</View>
				)}

				<View className="flex-row gap-3">
					{!hasAccepted && (
						<Button variant="outline" onPress={onReject}>
							<Text className="font-semibold">Recusar</Text>
						</Button>
					)}
					<Button
						onPress={() => {
							setHasAccepted(true);
							onAccept();
						}}
					>
						<Text className="font-semibold">
							{hasAccepted
								? "Retomar atendimento"
								: "Aceitar atendimento"}
						</Text>
					</Button>
				</View>
			</View>
		</View>
	);
}
