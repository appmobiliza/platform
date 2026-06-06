import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollView, View } from "react-native";

import BoxOptions from "@/components/box-options";
import { Header } from "@/components/header";
import { StepIndicator } from "@/components/step-indicator";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldSet } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";

import { authClient } from "@/lib/auth-client";
import { cacheUserInfo, setHasProfile } from "@/lib/auth-store";
import { clearOnboardingData, getOnboardingData } from "@/lib/onboarding-store";
import { trpc } from "@/lib/trpc/client";

import { onboardingSteps } from "@/constants/onboarding";
import {
	type ProfileAccessibilityInput,
	ProfileAccessibilitySchema,
} from "@/schemas";
import { toSessionUser } from "@/types/session";

export default function AccessibilityInfo() {
	const { control, handleSubmit } = useForm<ProfileAccessibilityInput>({
		resolver: zodResolver(ProfileAccessibilitySchema),
		defaultValues: {
			disabilityTypes: [],
			simplifiedInterface: false,
		},
		mode: "onTouched",
	});

	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const createStudent = trpc.profiles.createStudent.useMutation();

	const handleFinish = handleSubmit(
		async (data) => {
			setIsSubmitting(true);
			console.log(data);

			try {
				// Recupera dados da sessão atual
				const session = await authClient.getSession();
				const user = toSessionUser(
					session.data?.user as Record<string, unknown>,
				);

				console.log(user);

				// Recupera dados coletados nas etapas anteriores
				const onboardingData = getOnboardingData();

				// Cria o perfil do estudante via tRPC
				await createStudent.mutateAsync({
					enrollment: onboardingData.enrollment,
					course: onboardingData.course as never,
					shift: onboardingData.shift as never,
					campus: onboardingData.campus as never,
					phone: onboardingData.phone,
					gender: onboardingData.gender as never,
					simplifiedInterface: data.simplifiedInterface,
					disabilityTypes: data.disabilityTypes as never,
				});

				console.log("Perfil do estudante criado com sucesso");

				// Atualiza cache local indicando que o onboarding foi concluído
				setHasProfile(true);

				cacheUserInfo({
					id: user?.id ?? "",
					name: user?.name ?? "",
					email: user?.email ?? "",
					image: user?.image ?? null,
					role: user?.role ?? "student",
				});

				// Limpa dados temporários do onboarding
				clearOnboardingData();

				console.log("Onboarding concluído com sucesso");

				// Redireciona para o app principal
				router.replace("/(tabs)");
			} catch (error) {
				console.error("Erro ao finalizar onboarding:", error);
				Alert.alert(
					"Erro",
					"Não foi possível finalizar seu cadastro. Tente novamente.",
				);
			}
		},
		(errors) => {
			Alert.alert(
				"Erro",
				"Por favor, corrija os erros no formulário antes de continuar.",
			);
			console.log("ERRORS", errors);
		},
	);

	// const handleFinish = () => {
	// 	setIsLoggedIn(true);
	// };

	return (
		<View className="flex-1">
			<Header
				title="Cadastrar-se no Mobiliza"
				size="small"
				isDisabled={isSubmitting}
			/>

			<ScrollView
				className="flex-1"
				contentContainerClassName="px-4"
				keyboardShouldPersistTaps="handled"
			>
				<Text className="mb-6 text-base leading-relaxed text-muted-foreground">
					Selecione uma ou mais opções com base em suas necessidades
					de acessibilidade
				</Text>

				<StepIndicator
					steps={onboardingSteps}
					currentStepId="accessibility"
				/>

				<FieldSet className="mt-6">
					<FieldGroup>
						<Controller
							control={control}
							name="disabilityTypes"
							render={({ field, fieldState }) => (
								<BoxOptions
									value={field.value}
									onChange={field.onChange}
									error={fieldState.error?.message}
								/>
							)}
						/>

						<Field
							orientation="horizontal"
							label="Ativar interface adaptada para leitores de tela"
						>
							<Controller
								control={control}
								name="simplifiedInterface"
								render={({ field }) => (
									<Switch
										checked={field.value ?? false}
										onCheckedChange={field.onChange}
										accessibilityLabel="Ativar interface adaptada para leitores de tela"
										disabled={field.disabled}
									/>
								)}
							/>
						</Field>
					</FieldGroup>
				</FieldSet>

				<Button
					className="mt-8"
					onPress={handleFinish}
					disabled={isSubmitting}
				>
					<Text>{isSubmitting ? "Salvando..." : "Concluir"}</Text>
				</Button>
			</ScrollView>
		</View>
	);
}
