import { useState } from "react";

import { useRouter } from "expo-router";
import {
	ArrowLeft,
	Book,
	Building,
	MoreVertical,
	Plus,
	Star,
	Utensils,
} from "lucide-react-native";
import {
	Modal,
	Platform,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SavedPlaces() {
	const router = useRouter();
	const insets = useSafeAreaInsets();

	const [selectedPlace, setSelectedPlace] = useState<any>(null);
	const [showOptionsModal, setShowOptionsModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const savedPlaces = [
		{ id: 1, name: "RU - Restaurante Universitário", icon: Utensils },
		{ id: 2, name: "Biblioteca Central", icon: Book },
		{ id: 3, name: "Reitoria", icon: Building },
		{
			id: 4,
			name: "Banquinho da Meteorologia",
			subtitle: "Instituto de Jornalismo, UFAL",
			icon: Star,
			showMenu: true,
		},
	];

	const handleOpenOptions = (place: any) => {
		setSelectedPlace(place);
		setShowOptionsModal(true);
	};

	const handleEdit = () => {
		setShowOptionsModal(false);
		router.push("/saved/edit");
	};

	const handleDeleteClick = () => {
		setShowOptionsModal(false);
		setShowDeleteModal(true);
	};

	const confirmDelete = () => {
		setShowDeleteModal(false);
		// Lógica de exclusão aqui
	};

	return (
		<View className="flex-1">
			{/* Header */}
			<View
				className="px-6 pb-6 flex-col gap-4"
				style={{
					paddingTop: Math.max(
						insets.top + 10,
						Platform.OS === "ios" ? 50 : 30,
					),
				}}
			>
				<Pressable
					onPress={() => router.back()}
					style={({ pressed }) => pressed && { opacity: 0.7 }}
					className="p-2 -ml-2 self-start"
				>
					<ArrowLeft size={24} color="#111827" />
				</Pressable>
				<Text className="text-gray-900 font-bold text-3xl">
					Locais salvos
				</Text>
			</View>

			<ScrollView className="flex-1 px-6">
				{savedPlaces.map((place, index) => {
					const Icon = place.icon;
					return (
						<View
							key={place.id}
							className="flex-row items-center py-4 border-b border-gray-200"
						>
							<Icon size={20} color="#4B5563" />
							<View className="flex-1 ml-4">
								<Text className="text-gray-900 font-semibold text-base">
									{place.name}
								</Text>
								{place.subtitle && (
									<Text className="text-gray-500 text-xs mt-0.5">
										{place.subtitle}
									</Text>
								)}
							</View>
							{place.showMenu && (
								<Pressable
									onPress={() => handleOpenOptions(place)}
									className="p-2 -mr-2"
								>
									<MoreVertical size={20} color="#4B5563" />
								</Pressable>
							)}
						</View>
					);
				})}

				<Pressable
					style={({ pressed }) => pressed && { opacity: 0.7 }}
					onPress={() => router.push("/saved/address")}
					className="flex-row items-center py-4 gap-4"
				>
					<Plus size={20} color="#111827" />
					<Text className="text-gray-900 font-medium text-base">
						Adicionar um novo local
					</Text>
				</Pressable>
			</ScrollView>

			{/* Options Menu Modal */}
			<Modal visible={showOptionsModal} transparent animationType="fade">
				<Pressable
					className="flex-1 bg-black/20 justify-center items-center"
					onPress={() => setShowOptionsModal(false)}
				>
					<View
						className="bg-white rounded-xl w-48 shadow-lg py-2 absolute right-6"
						style={{ top: "40%" }}
					>
						<Pressable onPress={handleEdit} className="px-5 py-3">
							<Text className="text-gray-800 text-base">
								Editar
							</Text>
						</Pressable>
						<Pressable
							onPress={handleDeleteClick}
							className="px-5 py-3"
						>
							<Text className="text-gray-800 text-base">
								Excluir
							</Text>
						</Pressable>
					</View>
				</Pressable>
			</Modal>

			{/* Delete Confirmation Modal */}
			<Modal visible={showDeleteModal} transparent animationType="fade">
				<Pressable
					className="flex-1 bg-black/40 justify-center items-center px-6"
					onPress={() => setShowDeleteModal(false)}
				>
					<Pressable className="bg-white rounded-[24px] w-full pt-8 pb-6 px-6">
						<View className="w-12 h-1 bg-gray-300 rounded-full self-center absolute top-3" />
						<Text className="text-gray-900 font-bold text-lg text-center mb-4">
							Excluir {selectedPlace?.name || "Local"}?
						</Text>
						<Text className="text-gray-500 text-center mb-8 px-4">
							Deseja excluir {selectedPlace?.name || "Local"} dos
							locais salvos?
						</Text>
						<View className="gap-3">
							<Pressable
								style={({ pressed }) =>
									pressed && { opacity: 0.8 }
								}
								onPress={confirmDelete}
								className="bg-[#EF4444] py-3.5 rounded-xl items-center"
							>
								<Text className="text-white font-semibold text-base">
									Excluir
								</Text>
							</Pressable>
							<Pressable
								style={({ pressed }) =>
									pressed && { opacity: 0.8 }
								}
								onPress={() => setShowDeleteModal(false)}
								className="py-3.5 rounded-xl items-center"
							>
								<Text className="text-gray-600 font-semibold text-base">
									Cancelar
								</Text>
							</Pressable>
						</View>
					</Pressable>
				</Pressable>
			</Modal>
		</View>
	);
}
