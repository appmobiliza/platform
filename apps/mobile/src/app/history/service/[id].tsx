import { useState } from "react";
import { View, ScrollView, Modal, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { Header } from "@/components/header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2, Edit3, Footprints, Clock } from "lucide-react-native";

export default function ScholarServiceDetails() {
	const { id } = useLocalSearchParams();
	const router = useRouter();

	const [observation, setObservation] = useState<string | null>(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [draftObservation, setDraftObservation] = useState("");

	const handleSaveObservation = () => {
		setObservation(draftObservation);
		setIsEditModalOpen(false);
	};

	const handleDeleteObservation = () => {
		setObservation(null);
		setDraftObservation("");
		setIsDeleteModalOpen(false);
	};

	return (
		<View className="flex-1 bg-background">
			<Header title="Informações" />

			<ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
				{/* Map Placeholder */}
				<View className="h-48 w-full bg-secondary rounded-2xl items-end justify-end mb-4 border border-border">
					<View className="flex flex-row items-center justify-end gap-2 p-4">
						<View className="bg-primary px-3 py-1.5 rounded-full flex-row items-center">
							<Footprints size={14} color="#FFFFFF" className="mr-1" />
							<Text className="text-white text-xs font-semibold">2,1km</Text>
						</View>
						<View className="bg-primary px-3 py-1.5 rounded-full flex-row items-center">
							<Clock size={14} color="#FFFFFF" className="mr-1" />
							<Text className="text-white text-xs font-semibold">29m</Text>
						</View>
					</View>
				</View>

				{/* Title and Date */}
				<Text className="font-bold text-2xl text-foreground mb-1">
					CAC - Pista da UFAL
				</Text>
				<Text className="text-muted-foreground text-base mb-6">
					6 de agosto • 19h
				</Text>

				{/* Student Profile */}
				<View className="flex-row items-center mb-8">
					<Avatar alt="João Carlos's Avatar" className="h-12 w-12 mr-3 bg-[#EAF3DE]">
						<AvatarFallback>
							<Text className="text-[#27500A] font-bold">JC</Text>
						</AvatarFallback>
					</Avatar>
					<View>
						<Text className="font-bold text-base text-foreground">João Carlos</Text>
						<Text className="text-sm text-muted-foreground">Deficiência Visual</Text>
					</View>
				</View>

				{/* Route */}
				<View className="mb-8">
					<View className="flex-row items-start mb-1">
						<View className="w-5 h-5 rounded-full bg-info items-center justify-center mr-3 mt-0.5">
							<View className="w-2 h-2 bg-white rounded-full" />
						</View>
						<View className="flex-1 flex-row justify-between pr-2">
							<Text className="text-foreground font-medium text-base">
								CAC - Centro de Artes e Cultura
							</Text>
							<Text className="text-muted-foreground text-sm">8:04 PM</Text>
						</View>
					</View>

					<View className="w-0.5 h-6 bg-border ml-2.5 my-1" />

					<View className="flex-row items-start">
						<View className="w-5 h-5 rounded-full bg-primary items-center justify-center mr-3 mt-0.5">
							<View className="w-2 h-2 bg-white rounded-full" />
						</View>
						<View className="flex-1 flex-row justify-between pr-2">
							<Text className="text-foreground font-medium text-base">
								Pista da UFAL
							</Text>
							<Text className="text-muted-foreground text-sm">8:33 PM</Text>
						</View>
					</View>
				</View>

				{/* Observation Section */}
				{!observation ? (
					<Button 
						onPress={() => {
							setDraftObservation("");
							setIsEditModalOpen(true);
						}}
						className="w-full rounded-2xl h-14 mb-8"
					>
						<Edit3 size={20} color="#FFFFFF" className="mr-2" />
						<Text className="font-semibold text-base text-white">Adicionar observação</Text>
					</Button>
				) : (
					<View className="mb-8">
						<Text className="text-muted-foreground font-semibold text-xs mb-3 tracking-widest uppercase">
							OBSERVAÇÃO
						</Text>
						<View className="bg-secondary rounded-2xl p-4 mb-4">
							<Text className="text-foreground leading-relaxed font-medium">
								"{observation}"
							</Text>
						</View>
						
						<View className="flex-row gap-3">
							<Button 
								onPress={() => {
									setDraftObservation(observation);
									setIsEditModalOpen(true);
								}}
								className="flex-1 rounded-2xl h-14"
							>
								<Edit3 size={20} color="#FFFFFF" className="mr-2" />
								<Text className="font-semibold text-base text-white">Editar observação</Text>
							</Button>
							<Button 
								variant="destructive"
								onPress={() => setIsDeleteModalOpen(true)}
								className="w-14 h-14 rounded-2xl items-center justify-center"
							>
								<Trash2 size={24} color="#FFFFFF" />
							</Button>
						</View>
					</View>
				)}
			</ScrollView>

			{/* Edit/Add Modal */}
			<Modal
				visible={isEditModalOpen}
				transparent
				animationType="fade"
				onRequestClose={() => setIsEditModalOpen(false)}
			>
				<View className="flex-1 bg-black/60 justify-center items-center px-6">
					<View className="bg-card w-full rounded-[24px] p-6 border border-border">
						<Text className="font-bold text-xl text-foreground mb-4">
							{observation ? "Editar observação" : "Adicionar observação"}
						</Text>
						
						<View className="bg-background rounded-xl border border-border p-4 mb-6">
							<TextInput
								className="text-foreground text-base h-24"
								placeholder="Insira a observação aqui"
								placeholderTextColor="#A3A3A3"
								multiline
								textAlignVertical="top"
								value={draftObservation}
								onChangeText={setDraftObservation}
							/>
						</View>

						<Button 
							onPress={handleSaveObservation}
							className="w-full rounded-xl h-14 mb-3"
						>
							<Text className="font-semibold text-base text-white">Registrar</Text>
						</Button>
						<Button 
							variant="ghost"
							onPress={() => setIsEditModalOpen(false)}
							className="w-full rounded-xl h-14"
						>
							<Text className="font-semibold text-base text-foreground">Cancelar</Text>
						</Button>
					</View>
				</View>
			</Modal>

			{/* Delete Modal */}
			<Modal
				visible={isDeleteModalOpen}
				transparent
				animationType="fade"
				onRequestClose={() => setIsDeleteModalOpen(false)}
			>
				<View className="flex-1 bg-black/60 justify-center items-center px-6">
					<View className="bg-card w-full rounded-[24px] p-6 border border-border">
						<Text className="font-bold text-xl text-foreground mb-2">
							Remover observação?
						</Text>
						<Text className="text-muted-foreground text-base mb-6">
							A observação deste atendimento será removida do banco de dados.
						</Text>

						<Button 
							variant="destructive"
							onPress={handleDeleteObservation}
							className="w-full rounded-xl h-14 mb-3"
						>
							<Text className="font-semibold text-base text-white">Remover</Text>
						</Button>
						<Button 
							variant="outline"
							onPress={() => setIsDeleteModalOpen(false)}
							className="w-full rounded-xl h-14 bg-transparent border-border"
						>
							<Text className="font-semibold text-base text-foreground">Cancelar</Text>
						</Button>
					</View>
				</View>
			</Modal>
		</View>
	);
}
