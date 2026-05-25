import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, TouchableOpacity, View } from "react-native";

import AccessibilityOptions from "@/components/accessibility-options";
import { Header } from "@/components/header";
import { StepIndicator } from "@/components/step-indicator";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLegend,
	FieldSet,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";

import { zodResolver } from "@/lib/zod-resolver";

import { type AccessibilityInput, AccessibilitySchema } from "@/schemas";

export default function AccessibilityInfo() {
	const router = useRouter();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<AccessibilityInput>({
		resolver: zodResolver(AccessibilitySchema),
		defaultValues: {
			disabilityType: [],
			needsAudioDescription: false,
		},
		mode: "onTouched",
	});

	const steps = [
		{ id: "basic", title: "Dados Básicos" },
		{ id: "course", title: "Universidade" },
		{ id: "accessibility", title: "Acessibilidade" },
	];

	const handleFinish = handleSubmit(() => {
		// TODO: Integrar com API quando backend estiver pronto
		router.push("/");
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

				<StepIndicator steps={steps} currentStepId="accessibility" />

				<FieldSet className="mt-6">
					<FieldGroup>
						<Controller
							control={control}
							name="disabilityType"
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
								name="needsAudioDescription"
								render={({ field }) => (
									<Switch
										checked={field.value}
										onCheckedChange={field.onChange}
										accessibilityLabel="Ativar interface adaptada para leitores de tela"
									/>
								)}
							/>
						</Field>

						{errors.disabilityType ? (
							<FieldError
								className="mt-1"
								errors={[errors.disabilityType]}
							/>
						) : null}
					</FieldGroup>
				</FieldSet>

				<Button className="mt-8" onPress={handleFinish}>
					<Text>Concluir</Text>
				</Button>
			</ScrollView>
		</View>
	);
}
