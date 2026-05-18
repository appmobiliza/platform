import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Button } from "../../components/ui/Button";
import { Header } from "../../components/ui/Header";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { StepIndicator } from "../../components/ui/StepIndicator";

import { genderOptions } from "@/constants";

export default function BasicInfo() {
	const router = useRouter();
	const [gender, setGender] = useState("");

	const steps = [
		{ id: "basic", title: "Dados Básicos" },
		{ id: "course", title: "Universidade" },
		{ id: "accessibility", title: "Acessibilidade" },
	];

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
					Antes, precisamos de algumas informações suas para facilitar
					os atendimentos do MobiUFAL
				</Text>

				<StepIndicator steps={steps} currentStepId="basic" />

				<View className="mt-8 space-y-4 gap-4">
					<Input
						label="Nome Completo"
						placeholder="Fulano da Silva Júnior"
					/>

					<Input
						label="Telefone"
						placeholder="(DDD) XXXXX-XXXX"
						keyboardType="phone-pad"
					/>

					<Select
						label="Gênero"
						value={gender}
						onSelect={setGender}
						options={genderOptions}
						placeholder="Selecione seu gênero"
					/>
				</View>

				<Button
					className="mt-8"
					onPress={() => router.push("/onboarding/course")}
				>
					Continuar
				</Button>
			</ScrollView>
		</View>
	);
}
