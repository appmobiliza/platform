import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";

// import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

// import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

// import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

// import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { zodResolver } from "@hookform/resolvers/zod";
import { genderValues } from "@mobiliza/db";

import { Header } from "@/components/header";
import { StepIndicator } from "@/components/step-indicator";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MaskedInput } from "@/components/ui/masked-input";
import { SelectField } from "@/components/ui/select-field";
import { Text } from "@/components/ui/text";

import { onboardingSteps } from "@/constants/onboarding";
import { type BasicInfoInput, BasicInfoSchema } from "@/schemas";

export default function BasicInfo() {
	const router = useRouter();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<BasicInfoInput>({
		resolver: zodResolver(BasicInfoSchema),
		defaultValues: {
			name: "",
			phone: "",
			gender: undefined,
		},
		mode: "onTouched",
	});

	const handleContinue = handleSubmit(() => {
		router.push("/onboarding/course");
	});

	return (
		<View className="flex-1">
			<Header title="Cadastrar-se no Mobiliza" size="small" />

			<ScrollView
				className="flex-1"
				keyboardShouldPersistTaps="handled"
				contentContainerClassName="px-4"
			>
				{/* <Text className="mb-2 mt-2 text-2xl font-bold">
					Cadastrar-se no Mobiliza
				</Text> */}
				<Text className="mb-6 text-base leading-relaxed text-muted-foreground">
					Antes, precisamos de algumas informações suas para facilitar
					os atendimentos do MobiUFAL
				</Text>

				<StepIndicator steps={onboardingSteps} currentStepId="basic" />

				<View className="mt-8 gap-4">
					<Controller
						control={control}
						name="name"
						render={({ field }) => (
							<Field
								label="Nome Completo"
								description="Use o nome que deve aparecer nos seus atendimentos."
								error={errors.name?.message}
							>
								<Input
									placeholder="Fulano da Silva Júnior"
									value={field.value}
									onBlur={field.onBlur}
									onChangeText={field.onChange}
									autoCapitalize="words"
									autoComplete="name"
									accessibilityLabel="Nome Completo"
									aria-invalid={Boolean(errors.name)}
								/>
							</Field>
						)}
					/>

					<Controller
						control={control}
						name="phone"
						render={({ field }) => (
							<Field
								label="Telefone"
								description="Use o número principal para contato e recuperação da conta."
								error={errors.phone?.message}
							>
								<MaskedInput
									mask="phone"
									placeholder="(DDD) XXXXX-XXXX"
									value={field.value}
									onBlur={field.onBlur}
									onChangeText={field.onChange}
									autoComplete="tel"
									accessibilityLabel="Telefone"
									aria-invalid={Boolean(errors.phone)}
								/>
							</Field>
						)}
					/>

					<Controller
						control={control}
						name="gender"
						render={({ field }) => (
							<SelectField
								label="Gênero"
								description="Selecione a opção que melhor representa você."
								value={field.value}
								placeholder="Selecionar gênero"
								options={genderValues.map((value) => ({
									value,
									label: value,
								}))}
								onValueChange={field.onChange}
								error={errors.gender?.message}
							/>
						)}
					/>
				</View>

				<Button className="mt-8" onPress={handleContinue}>
					<Text>Continuar</Text>
				</Button>
			</ScrollView>
		</View>
	);
}
