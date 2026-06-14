import { View } from "react-native";

import { AddressRoute } from "@/components/address";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { FlowStep } from "./flow-step";
import type { StepBaseProps } from "./types";

// ─── Props ────────────────────────────────────────────────────────────────

export interface ScholarFoundStepProps extends StepBaseProps {
	scholarName: string;
	scholarImage: string | null;
	originName: string;
	destinationName: string;
	onCancel: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────

export function ScholarFoundStep({
	style,
	scholarName,
	scholarImage,
	originName,
	destinationName,
	onCancel,
}: ScholarFoundStepProps) {
	const initials = scholarName
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<View className="flex-1" style={style}>
			<FlowStep
				subtitle="Bolsista encontrado!"
				title="Você será atendido por"
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
								<Text className="text-[16px] font-semibold leading-6 text-foreground">
									{scholarName}
								</Text>
							</View>
						</View>
					</View>
				}
			>
				<View className="items-center gap-6 px-4">
					<AddressRoute
						className="bg-input p-4 rounded-lg w-full"
						from={{
							label: originName,
						}}
						to={{ label: destinationName }}
						shouldShowRoute
						size="accessibility"
					/>

					<Text className="text-base text-muted-foreground text-center">
						Aguarde enquanto o bolsista vai ao seu encontro
					</Text>

					<Button
						variant="destructive"
						size="lg"
						className="h-16 w-full"
						onPress={onCancel}
						accessible
						accessibilityRole="button"
						accessibilityLabel="Cancelar solicitação"
					>
						<Text className="text-xl">Cancelar solicitação</Text>
					</Button>
				</View>
			</FlowStep>
		</View>
	);
}
