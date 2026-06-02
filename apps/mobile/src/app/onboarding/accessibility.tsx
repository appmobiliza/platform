import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";

import AccessibilityOptions from "@/components/accessibility-options";
import { Header } from "@/components/header";
import { StepIndicator } from "@/components/step-indicator";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldSet } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";

import { setIsLoggedIn } from "@/lib/auth-store";

import { onboardingSteps } from "@/constants/onboarding";
import {
	type ProfileAccessibilityInput,
	ProfileAccessibilitySchema,
} from "@/schemas";

export default function AccessibilityInfo() {
	const { control, handleSubmit } = useForm<ProfileAccessibilityInput>({
		resolver: zodResolver(ProfileAccessibilitySchema),
		defaultValues: {
			disabilities: [],
			simplifiedInterface: false,
		},
		mode: "onTouched",
	});

	const handleFinish = handleSubmit(() => {
		// TODO: Integrar com API quando backend estiver pronto
		setIsLoggedIn(true);
	});

	return (
		<View className="flex-1">
			<Header title="Cadastrar-se no Mobiliza" size="small" />

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
							name="disabilities"
							render={({ field, fieldState }) => (
								<AccessibilityOptions
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
										checked={field.value}
										onCheckedChange={field.onChange}
										accessibilityLabel="Ativar interface adaptada para leitores de tela"
										disabled={field.disabled}
									/>
								)}
							/>
						</Field>
					</FieldGroup>
				</FieldSet>

				<Button className="mt-8" onPress={handleFinish}>
					<Text>Concluir</Text>
				</Button>
			</ScrollView>
		</View>
	);
}
