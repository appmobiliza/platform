import { getCurrentShift, scholarShiftLabels } from "@mobiliza/contracts";

import { View } from "react-native";

import { AddressRoute } from "@/components/address";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { formatShortDate } from "@/lib/date";
import type { ScholarInfo } from "@/lib/request-store";

import { SheetFrame, StageSheet } from "../subcomponents/layout";
import type { StageBaseProps } from "./types";

interface TripStageProps extends StageBaseProps {
	scholarInfo: ScholarInfo | null;
}

function getDisplayShift(scholar: ScholarInfo | null): string {
	// Usa o turno informado no payload, ou fallback para o turno atual baseado no horário
	const shift = scholar?.shift ?? getCurrentShift();
	return scholarShiftLabels[shift as keyof typeof scholarShiftLabels];
}

function TripStage({
	modalRef,
	handleDismiss,
	isDark,
	origin,
	destination,
	scholarInfo,
	dismissAndExit,
}: TripStageProps) {
	return (
		<StageSheet
			stage="trip"
			modalRef={modalRef}
			onDismiss={handleDismiss}
			colorScheme={isDark ? "dark" : "light"}
		>
			<SheetFrame
				title="Vá até o ponto de partida"
				description={`${origin?.abbreviation ? `${origin?.abbreviation} - ` : ""}${origin?.name ?? ""}`}
				shouldWrapChildren
				footer={
					<Button variant="destructive" onPress={dismissAndExit}>
						<Text>Cancelar deslocamento</Text>
					</Button>
				}
			>
				<View className="gap-4 rounded-md border border-border bg-card px-4 py-4">
					<View className="flex-row items-start gap-4">
						<Avatar
							alt="Avatar do contribuinte"
							className="size-12"
						>
							{scholarInfo?.image ? (
								<AvatarImage
									source={{
										uri: scholarInfo.image,
									}}
								/>
							) : null}
							<AvatarFallback>
								<Text>
									{scholarInfo?.name
										?.split(" ")
										.map((n) => n[0])
										.join("")
										.slice(0, 2)
										.toUpperCase() ?? ""}
								</Text>
							</AvatarFallback>
						</Avatar>
						<View className="flex-1 gap-0.5">
							<View className="flex-row items-center justify-between gap-3">
								<Text className="text-[16px] font-semibold leading-6 text-foreground">
									{scholarInfo?.name ?? "Contribuinte"}
								</Text>
								<Text className="text-[14px] leading-5 text-muted-foreground">
									{scholarInfo?.createdAt
										? `desde ${formatShortDate(scholarInfo.createdAt)}`
										: ""}
								</Text>
							</View>
							<Badge variant={"secondary"}>
								<Text>{getDisplayShift(scholarInfo)}</Text>
							</Badge>
						</View>
					</View>
				</View>

				<Text className="text-sm font-semibold leading-6 text-foreground">
					TRAJETO
				</Text>

				<AddressRoute
					className="bg-input p-4 rounded-lg"
					from={{
						label: origin?.abbreviation ?? origin?.name ?? "",
					}}
					to={{
						label: destination?.name ?? "",
					}}
					maxLines={2}
					shouldShowRoute
				/>
			</SheetFrame>
		</StageSheet>
	);
}

export { TripStage };
