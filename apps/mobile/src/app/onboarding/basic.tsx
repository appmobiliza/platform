import { useState } from "react";

import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { genderOptions } from "@/constants";
import { type BasicInfoInput, BasicInfoSchema } from "@/schemas";

import { Button } from "../../components/old/Button_test";
import { Header } from "../../components/old/Header";
import { Input } from "../../components/old/Input";
import { Select } from "../../components/old/Select";
import { StepIndicator } from "../../components/old/StepIndicator";

export default function BasicInfo() {
	const router = useRouter();

	const [name, setName] = useState("");
	const [phone, setPhone] = useState("");
	const [gender, setGender] = useState("");
	const [errors, setErrors] = useState<
		Partial<Record<keyof BasicInfoInput, string>>
	>({});

	const steps = [
		{ id: "basic", title: "Dados Básicos" },
		{ id: "course", title: "Universidade" },
		{ id: "accessibility", title: "Acessibilidade" },
	];

	const handleContinue = () => {
		const data: BasicInfoInput = { name, phone, gender };
		const result = BasicInfoSchema.safeParse(data);

		if (!result.success) {
			const fieldErrors: Partial<Record<keyof BasicInfoInput, string>> =
				{};
			result.error.issues.forEach((issue) => {
				const field = issue.path[0] as keyof BasicInfoInput;
				fieldErrors[field] = issue.message;
			});
			setErrors(fieldErrors);
			return;
		}

		setErrors({});
		router.push("/onboarding/course");
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
					Antes, precisamos de algumas informações suas para facilitar
					os atendimentos do MobiUFAL
				</Text>

				<StepIndicator steps={steps} currentStepId="basic" />

				<View className="mt-8 space-y-4 gap-4">
					<Input
						label="Nome Completo"
						placeholder="Fulano da Silva Júnior"
						value={name}
						onChangeText={setName}
						error={errors.name}
					/>

					<Input
						label="Telefone"
						placeholder="(DDD) XXXXX-XXXX"
						keyboardType="phone-pad"
						value={phone}
						onChangeText={setPhone}
						error={errors.phone}
					/>

					<Select
						label="Gênero"
						value={gender}
						onSelect={setGender}
						options={genderOptions}
						placeholder="Selecione seu gênero"
						error={errors.gender}
					/>
				</View>

				<Button className="mt-8" onPress={handleContinue}>
					Continuar
				</Button>
			</ScrollView>
		</View>
	);
}
