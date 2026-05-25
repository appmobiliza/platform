import React, { useState } from "react";

import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";

import { Header } from "@/components/header";
import { StepIndicator } from "@/components/step-indicator";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { MaskedInput } from "@/components/ui/masked-input";
import { Text } from "@/components/ui/text";

import { genderOptions } from "@/constants";
import { type BasicInfoInput, BasicInfoSchema } from "@/schemas";

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
		<View className="flex-1">
			<Header title="Dados Básicos" />

			<ScrollView
				className="flex-1"
				contentContainerStyle={{
					paddingHorizontal: 24,
					paddingBottom: 32,
				}}
			>
				<Text className="text-2xl font-bold mt-2 mb-2">
					Cadastrar-se no Mobiliza
				</Text>
				<Text className="text-sm text-muted-foreground leading-relaxed mb-6">
					Antes, precisamos de algumas informações suas para facilitar
					os atendimentos do MobiUFAL
				</Text>

				<StepIndicator steps={steps} currentStepId="basic" />

				<View className="mt-8 space-y-4 gap-4">
					<Field label="Nome Completo">
						<Input
							placeholder="Fulano da Silva Júnior"
							value={name}
							onChangeText={setName}
							// error={errors.name}
						/>
					</Field>

					<Field label="Telefone">
						<MaskedInput
							mask="phone"
							placeholder="(DDD) XXXXX-XXXX"
							value={phone}
							onChangeText={setPhone}
							// error={errors.phone}
						/>
					</Field>

					{/* <Select
						label="Gênero"
						value={gender}
						onSelect={setGender}
						options={genderOptions}
						placeholder="Selecione seu gênero"
						error={errors.gender}
					/> */}
				</View>

				<Button className="mt-8" onPress={handleContinue}>
					<Text>Continuar</Text>
				</Button>
			</ScrollView>
		</View>
	);
}
