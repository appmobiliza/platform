import { Check } from "lucide-react-native";
import { View } from "react-native";

import { AddressRoute } from "@/components/address";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { FlowStep } from "./flow-step";
import type { StepBaseProps } from "./types";

// ─── Props ────────────────────────────────────────────────────────────────

export interface CompletedStepProps extends StepBaseProps {
	scholarName: string;
	scholarImage: string | null;
	originName: string;
	destinationName: string;
	onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────

export function CompletedStep({
	style,
	scholarName,
	scholarImage,
	originName,
	destinationName,
	onClose,
}: CompletedStepProps) {
	const initials = scholarName
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<View className="flex-1" style={style}>
			<FlowStep
				subtitle="Viagem concluída"
				title="Chegou ao destino"
				note={
					<View className="flex-row items-center justify-center gap-4">
						<Avatar
							alt="Avatar do contribuinte"
							className="size-12"
						>
							{scholarImage ? (
								<AvatarImage
									source={{
										uri: scholarImage,
									}}
								/>
							) : null}
							<AvatarFallback>
								<Text>{initials}</Text>
							</AvatarFallback>
						</Avatar>
						<View className="flex-1 gap-0.5">
							<View className="flex-row items-center justify-between gap-3">
								<Text className="text-xl font-semibold leading-6 text-foreground">
									{scholarName}
								</Text>
							</View>
						</View>
					</View>
				}
			>
				<View className="items-center gap-6 px-4">
					<View className="items-center justify-center size-24 rounded-full bg-green-100">
						<Icon icon={Check} size={48} color="#16a34a" />
					</View>

					<Text className="text-2xl font-bold text-foreground text-center">
						Viagem finalizada com sucesso!
					</Text>

					<AddressRoute
						className="bg-input p-4 rounded-lg w-full"
						from={{
							label: originName,
						}}
						to={{ label: destinationName }}
						shouldShowRoute
						size="accessibility"
					/>

					<Button
						variant="default"
						size="lg"
						className="h-16 w-full"
						onPress={onClose}
						accessible
						accessibilityRole="button"
						accessibilityLabel="Fechar"
					>
						<Text className="text-xl">Fechar</Text>
					</Button>
				</View>
			</FlowStep>
		</View>
	);
}
