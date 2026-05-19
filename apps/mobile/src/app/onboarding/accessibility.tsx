import { useRouter } from "expo-router";
import { Accessibility, Ear, Ellipsis, Eye } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { Button } from "../../components/ui/Button";
import { Header } from "../../components/ui/Header";
import { StepIndicator } from "../../components/ui/StepIndicator";

import { AccessibilitySchema, type AccessibilityInput } from "@/schemas";

const INITIAL_OPTIONS = [
	{ id: "physical", label: "Deficiência física ou\nmobilidade reduzida", icon: Accessibility },
	{ id: "hearing", label: "Deficiência auditiva", icon: Ear },
	{ id: "visual", label: "Cegueira ou\nbaixa visão", icon: Eye },
	{ id: "other", label: "Outro tipo", icon: Ellipsis },
];

export default function AccessibilityInfo() {
	const router = useRouter();
	const [audioEnabled, setAudioEnabled] = useState(false);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [errors, setErrors] = useState<Partial<Record<keyof AccessibilityInput, string>>>({});

	const toggleSelection = (id: string) => {
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
		);
	};

	const steps = [
		{ id: "basic", title: "Dados Básicos" },
		{ id: "course", title: "Universidade" },
		{ id: "accessibility", title: "Acessibilidade" },
	];

	const handleFinish = () => {
		const data: AccessibilityInput = {
			disabilityType: selectedIds,
			needsAudioDescription: audioEnabled,
		};
		const result = AccessibilitySchema.safeParse(data);

		if (!result.success) {
			const fieldErrors: Partial<Record<keyof AccessibilityInput, string>> = {};
			result.error.issues.forEach((issue) => {
				const field = issue.path[0] as keyof AccessibilityInput;
				fieldErrors[field] = issue.message;
			});
			setErrors(fieldErrors);
			return;
		}

		setErrors({});
		// TODO: Integrar com API quando backend estiver pronto
		router.push("/");
	};

	return (
		<View className="flex-1 bg-white">
			<Header />

			<ScrollView
				className="flex-1"
				contentContainerStyle={{
					paddingHorizontal: 24,
					paddingBottom: 32,
				}}
			>
				<Text className="text-2xl font-bold text-neutral-900 mt-2 mb-2">
					Cadastrar-se no Mobiliza
				</Text>
				<Text className="text-sm text-neutral-500 leading-relaxed mb-6">
					Selecione uma ou mais opções com base em suas necessidades
					de acessibilidade
				</Text>

				<StepIndicator steps={steps} currentStepId="accessibility" />

				{errors.disabilityType && (
					<Text className="text-sm text-red-500 mt-4">{errors.disabilityType}</Text>
				)}

				<View className="mt-8 flex-row flex-wrap justify-between">
					{INITIAL_OPTIONS.map((option) => {
						const Icon = option.icon;
						const isSelected = selectedIds.includes(option.id);

						return (
							<TouchableOpacity
								key={option.id}
								activeOpacity={0.8}
								onPress={() => toggleSelection(option.id)}
								className={[
									"w-[48%] mb-4 p-4 rounded-xl items-center justify-center min-h-[120px] border-2",
									isSelected
										? "bg-brand-primary border-brand-primary"
										: "bg-white border-neutral-200",
								]
									.filter(Boolean)
									.join(" ")}
							>
								<Icon
									size={32}
									color={
										isSelected ? "#ffffff" : "#171717"
									}
									strokeWidth={2}
								/>
								<Text
									className={[
										"text-center mt-3 text-sm font-medium",
										isSelected
											? "text-white"
											: "text-neutral-900",
									]
										.filter(Boolean)
										.join(" ")}
								>
									{option.label}
								</Text>
							</TouchableOpacity>
						);
					})}
				</View>

				<View className="flex-row items-center justify-between mt-4 mb-8 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
					<Text className="text-base font-medium text-neutral-900 flex-1 mr-4">
						Ativar pedidos por áudio automaticamente
					</Text>
					<Switch
						value={audioEnabled}
						onValueChange={setAudioEnabled}
						trackColor={{ false: "#d4d4d4", true: "#00635D" }}
						thumbColor={"#ffffff"}
					/>
				</View>

				<Button onPress={handleFinish}>Concluir</Button>
			</ScrollView>
		</View>
	);
}
