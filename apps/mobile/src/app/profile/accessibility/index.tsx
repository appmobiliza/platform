import { disabilityTypeLabels } from "@mobiliza/contracts";

import { useState } from "react";
import { View } from "react-native";

import { SettingsButton } from "@/components/settings-button";
import { Switch } from "@/components/ui/switch";

import { setSimplifiedInterface as setCacheSimplifiedInterface } from "@/lib/auth-store";
import { trpc } from "@/lib/trpc/client";

export default function AccessibilityProfile() {
	const { data: userData, isLoading } = trpc.profiles.me.useQuery();
	const updateStudent = trpc.profiles.updateStudent.useMutation();
	const utils = trpc.useUtils();

	const studentProfile = userData?.studentProfile;

	const [simplifiedInterface, setSimplifiedInterface] = useState(
		studentProfile?.simplifiedInterface ?? false,
	);

	const [voiceProcessingOnline, setVoiceProcessingOnline] = useState(
		studentProfile?.voiceProcessingOnline ?? true,
	);

	const handleSimplifiedInterfaceChange = async (value: boolean) => {
		setSimplifiedInterface(value);
		setCacheSimplifiedInterface(value);
		try {
			await updateStudent.mutateAsync({ simplifiedInterface: value });
			await utils.profiles.me.invalidate();
		} catch (error) {
			console.error("Erro ao salvar interface simplificada:", error);
			setSimplifiedInterface(!value);
			setCacheSimplifiedInterface(!value);
		}
	};

	const handleVoiceProcessingOnlineChange = async (value: boolean) => {
		setVoiceProcessingOnline(value);
		try {
			await updateStudent.mutateAsync({ voiceProcessingOnline: value });
			await utils.profiles.me.invalidate();
		} catch (error) {
			console.error(
				"Erro ao salvar preferência de processamento de voz:",
				error,
			);
			setVoiceProcessingOnline(!value);
		}
	};

	const disabilityLabels =
		studentProfile?.disabilities
			?.map(
				(d) =>
					disabilityTypeLabels[
						d.disabilityType as keyof typeof disabilityTypeLabels
					],
			)
			.join(", ") || "Nenhuma";

	const observationPreview = studentProfile?.attendanceNotes
		? `"${studentProfile.attendanceNotes}"`
		: "Nenhuma";

	const disabilityTypesJson = studentProfile?.disabilities
		? encodeURIComponent(
				JSON.stringify(
					studentProfile.disabilities.map((d) => d.disabilityType),
				),
			)
		: "";

	if (isLoading || !userData) {
		return (
			<View className="flex-1">
				<SettingsButton
					title="Tipo de deficiência"
					label="Carregando..."
					href="/profile/accessibility/disabilities"
				/>
			</View>
		);
	}

	return (
		<View className="flex-1">
			<SettingsButton
				title="Tipo de deficiência"
				label={disabilityLabels}
				href={`/profile/accessibility/disabilities?disabilityTypes=${disabilityTypesJson}`}
			/>
			<SettingsButton
				title="Observações"
				label={observationPreview}
				href={`/profile/accessibility/observation?attendanceNotes=${encodeURIComponent(studentProfile?.attendanceNotes ?? "")}`}
			/>
			<SettingsButton
				title="Interface simplificada"
				label="Altera a página inicial e o processo de requisição de atendimentos"
			>
				<Switch
					checked={simplifiedInterface}
					onCheckedChange={handleSimplifiedInterfaceChange}
				/>
			</SettingsButton>
			<SettingsButton
				title="Processamento de voz online"
				label="Quando ativo, o áudio pode ser enviado a servidores externos para reconhecimento de fala mais preciso"
			>
				<Switch
					checked={voiceProcessingOnline}
					onCheckedChange={handleVoiceProcessingOnlineChange}
				/>
			</SettingsButton>
		</View>
	);
}
