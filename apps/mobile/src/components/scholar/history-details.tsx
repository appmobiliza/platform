import { useState } from "react";

import { Clock, Edit3, Footprints, Trash2 } from "lucide-react-native";
import { View } from "react-native";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";

import { HistoryDetailLayout } from "@/layout/history-details";

export default function ScholarHistoryDetails() {
	const [observation, setObservation] = useState<string | null>(null);
	const [draftObservation, setDraftObservation] = useState("");

	const handleSaveObservation = () => {
		setObservation(draftObservation);
	};

	const handleDeleteObservation = () => {
		setObservation(null);
		setDraftObservation("");
	};

	return (
		<HistoryDetailLayout
			title="CAC - Pista da UFAL"
			subtitle="6 de agosto • 19h"
			mapBadges={
				<>
					<Badge className="text-primary-foreground">
						<Icon
							icon={Footprints}
							size={14}
							color="primary-foreground"
						/>
						<Text>2,1km</Text>
					</Badge>
					<Badge className="text-primary-foreground">
						<Icon
							icon={Clock}
							size={14}
							color="primary-foreground"
						/>
						<Text>29m</Text>
					</Badge>
				</>
			}
			profile={
				<View className="flex-row items-center gap-3">
					<Avatar alt="Zach Nugent's Avatar">
						<AvatarImage
							source={{
								uri: "https://github.com/meninocoiso.png",
							}}
						/>
						<AvatarFallback>
							<Text>ZN</Text>
						</AvatarFallback>
					</Avatar>
					<View>
						<Text className="font-bold text-base text-foreground">
							João Carlos
						</Text>
						<Text className="text-sm text-muted-foreground">
							Deficiência Visual
						</Text>
					</View>
				</View>
			}
			route={{
				from: {
					label: "CAC - Centro de Artes e Cultura",
					className: "px-3 py-4",
					children: (
						<Text className="text-xs font-medium text-muted-foreground">
							8:04 PM
						</Text>
					),
				},
				to: {
					label: "Pista da UFAL",
					className: "px-3 py-4",
					children: (
						<Text className="text-xs font-medium text-muted-foreground">
							8:33 PM
						</Text>
					),
				},
			}}
		>
			{!observation ? (
				<MutateObservationSheet
					draft={draftObservation}
					setDraft={setDraftObservation}
					onSave={handleSaveObservation}
				>
					<Button
						size={"lg"}
						onPress={() => {
							setDraftObservation("");
						}}
						className="w-full rounded-full"
					>
						<Edit3 size={20} color="#FFFFFF" className="mr-2" />
						<Text className="font-semibold text-base text-white">
							Adicionar observação
						</Text>
					</Button>
				</MutateObservationSheet>
			) : (
				<View>
					<Text className="text-muted-foreground font-semibold text-xs mb-3 tracking-widest uppercase">
						OBSERVAÇÃO
					</Text>
					<View className="bg-secondary p-4 mb-4 rounded-md">
						<Text className="text-foreground leading-relaxed font-medium">
							"{observation}"
						</Text>
					</View>

					<View className="flex-row gap-3">
						<MutateObservationSheet
							defaultValue={observation}
							draft={draftObservation}
							setDraft={setDraftObservation}
							onSave={handleSaveObservation}
						>
							<Button
								onPress={() => {
									setDraftObservation(observation);
								}}
								className="flex-1 rounded-full"
							>
								<Edit3
									size={20}
									color="#FFFFFF"
									className="mr-2"
								/>
								<Text className="font-semibold text-base text-white">
									Editar observação
								</Text>
							</Button>
						</MutateObservationSheet>
						<RemoveObservationSheet
							onDelete={handleDeleteObservation}
						>
							<Button
								variant="destructive"
								className="w-12 rounded-full"
							>
								<Trash2 size={24} color="#FFFFFF" />
							</Button>
						</RemoveObservationSheet>
					</View>
				</View>
			)}
		</HistoryDetailLayout>
	);
}

interface Props {
	children: React.ReactNode;
	defaultValue?: string;
}

interface MutateProps extends Props {
	draft: string;
	setDraft: (v: string) => void;
	onSave: () => void;
	onCancel?: () => void;
}

function MutateObservationSheet({
	defaultValue,
	children,
	draft,
	setDraft,
	onSave,
	onCancel,
}: MutateProps) {
	return (
		<Sheet>
			<SheetTrigger asChild>{children}</SheetTrigger>
			<SheetContent panDownToClose enableDynamicSizing>
				<SheetHeader>
					<SheetTitle>
						{defaultValue
							? "Editar observação"
							: "Adicionar observação"}
					</SheetTitle>
				</SheetHeader>
				<View className="p-4">
					<Textarea
						className="text-foreground text-base h-24 border border-border p-4"
						placeholder="Insira a observação aqui"
						multiline
						textAlignVertical="top"
						value={draft}
						onChangeText={setDraft}
					/>
				</View>
				<SheetFooter>
					<SheetClose asChild>
						<Button
							onPress={() => {
								onSave();
							}}
							className="w-full"
						>
							<Text className="font-semibold text-base">
								{defaultValue ? "Atualizar" : "Registrar"}
							</Text>
						</Button>
					</SheetClose>
					<SheetClose asChild>
						<Button
							onPress={() => onCancel?.()}
							variant="outline"
							className="w-full"
						>
							<Text className="font-semibold text-base text-foreground">
								Cancelar
							</Text>
						</Button>
					</SheetClose>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}

interface RemoveProps extends Props {
	onDelete: () => void;
	onCancel?: () => void;
}

function RemoveObservationSheet({ children, onDelete, onCancel }: RemoveProps) {
	return (
		<Sheet>
			<SheetTrigger asChild>{children}</SheetTrigger>
			<SheetContent className="gap-4" panDownToClose enableDynamicSizing>
				<SheetHeader>
					<SheetTitle>Remover observação?</SheetTitle>
					<SheetDescription>
						A observação deste atendimento será removida do banco de
						dados. Esta ação não pode ser desfeita.
					</SheetDescription>
				</SheetHeader>
				<SheetFooter>
					<SheetClose asChild>
						<Button
							onPress={() => {
								onDelete();
							}}
							variant="destructive"
							className="w-full"
						>
							<Text className="font-semibold text-base text-white">
								Remover
							</Text>
						</Button>
					</SheetClose>
					<SheetClose asChild>
						<Button
							onPress={() => onCancel?.()}
							variant="outline"
							className="w-full bg-transparent border-border"
						>
							<Text className="font-semibold text-base text-foreground">
								Cancelar
							</Text>
						</Button>
					</SheetClose>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
