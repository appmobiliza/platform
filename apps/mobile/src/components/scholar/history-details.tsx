import { Clock, Edit3, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

import { HistoryDetailLayout } from "@/layout/history-details";

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

import { formatDateTime, formatTime } from "@/lib/date";
import type { RouterOutputs } from "@/lib/trpc/client";

type ScholarAttendance =
	RouterOutputs["requests"]["scholarHistory"]["items"][number];

interface DetailProps {
	attendance: ScholarAttendance;
}

export default function ScholarHistoryDetails({ attendance }: DetailProps) {
	const [observation, setObservation] = useState<string | null>(null);
	const [draftObservation, setDraftObservation] = useState("");

	const handleSaveObservation = () => {
		setObservation(draftObservation);
	};

	const handleDeleteObservation = () => {
		setObservation(null);
		setDraftObservation("");
	};

	const { request } = attendance;
	const studentUser = request.studentProfile?.user;
	const studentName = studentUser?.name ?? "Estudante";
	const studentInitials = studentName
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	const originName = request.originLocation?.name ?? "Origem";
	const destinationName = request.destinationLocation?.name ?? "Destino";
	const title = `${originName} → ${destinationName}`;
	const subtitle = formatDateTime(new Date(attendance.acceptedAt));

	const durationMinutes = attendance.durationSeconds
		? Math.round(attendance.durationSeconds / 60)
		: null;

	const startedAt = attendance.startedAt
		? new Date(attendance.startedAt)
		: null;
	const completedAt = attendance.completedAt
		? new Date(attendance.completedAt)
		: null;

	return (
		<HistoryDetailLayout
			title={title}
			subtitle={subtitle}
			mapBadges={
				durationMinutes ? (
					<Badge className="text-primary-foreground">
						<Icon
							icon={Clock}
							size={14}
							color="--primary-foreground"
						/>
						<Text>{durationMinutes}m</Text>
					</Badge>
				) : null
			}
			profile={
				<View className="flex-row items-center gap-3">
					<Avatar alt={`Avatar de ${studentName}`}>
						{studentUser?.image ? (
							<AvatarImage source={{ uri: studentUser.image }} />
						) : null}
						<AvatarFallback>
							<Text>{studentInitials}</Text>
						</AvatarFallback>
					</Avatar>
					<View>
						<Text className="font-bold text-base text-foreground">
							{studentName}
						</Text>
					</View>
				</View>
			}
			route={{
				from: {
					label: originName,
					className: "px-3 py-4",
					children: startedAt ? (
						<Text className="text-xs font-medium text-muted-foreground">
							{formatTime(startedAt)}
						</Text>
					) : null,
				},
				to: {
					label: destinationName,
					className: "px-3 py-4",
					children: completedAt ? (
						<Text className="text-xs font-medium text-muted-foreground">
							{formatTime(completedAt)}
						</Text>
					) : null,
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
						size="lg"
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
