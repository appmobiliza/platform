import { useRouter } from "expo-router";
import { Accessibility, Ear, Ellipsis, Eye } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, TouchableOpacity, View } from "react-native";

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

const INITIAL_OPTIONS = [
	{
		id: "physical",
		label: "Deficiência física ou\nmobilidade reduzida",
		icon: Accessibility,
	},
	{ id: "hearing", label: "Deficiência auditiva", icon: Ear },
	{ id: "visual", label: "Cegueira ou\nbaixa visão", icon: Eye },
	{ id: "other", label: "Outro tipo", icon: Ellipsis },
];

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
		<View className="flex-1 px-4">
			<Header title="Cadastrar-se no Mobiliza" />

			<ScrollView
				className="flex-1"
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={{
					paddingHorizontal: 24,
					paddingBottom: 32,
				}}
			>
				<Text className="mb-2 mt-2 text-2xl font-bold">
					Cadastrar-se no Mobiliza
				</Text>
				<Text className="mb-6 text-sm leading-relaxed text-muted-foreground">
					Selecione uma ou mais opções com base em suas necessidades
					de acessibilidade
				</Text>

				<StepIndicator steps={steps} currentStepId="accessibility" />

				<FieldSet className="mt-8">
					<FieldLegend>Acessibilidade</FieldLegend>
					<FieldDescription>
						Selecione as necessidades que descrevem sua experiência.
					</FieldDescription>

					<FieldGroup className="mt-4">
						<Controller
							control={control}
							name="disabilityType"
							render={({ field, fieldState }) => {
								const selectedIds = field.value ?? [];

								return (
									<Field
										label="Tipos de acessibilidade"
										description="Selecione uma ou mais opções."
										error={fieldState.error?.message}
									>
										<View className="mt-4 flex-row flex-wrap justify-between">
											{INITIAL_OPTIONS.map((option) => {
												const Icon = option.icon;
												const isSelected =
													selectedIds.includes(
														option.id,
													);

												return (
													<TouchableOpacity
														key={option.id}
														activeOpacity={0.8}
														onPress={() => {
															const nextValue =
																isSelected
																	? selectedIds.filter(
																			(
																				item,
																			) =>
																				item !==
																				option.id,
																		)
																	: [
																			...selectedIds,
																			option.id,
																		];

															field.onChange(
																nextValue,
															);
														}}
														accessibilityRole="checkbox"
														accessibilityState={{
															checked: isSelected,
														}}
														className={[
															"mb-4 min-h-[120px] w-[48%] items-center justify-center rounded-xl border-2 p-4",
															isSelected
																? "border-brand-primary bg-brand-primary"
																: "border-neutral-200 bg-white",
														].join(" ")}
													>
														<Icon
															size={32}
															color={
																isSelected
																	? "#ffffff"
																	: "#171717"
															}
															strokeWidth={2}
														/>
														<Text
															className={[
																"mt-3 text-center text-sm font-medium",
																isSelected
																	? "text-white"
																	: "text-neutral-900",
															].join(" ")}
														>
															{option.label}
														</Text>
													</TouchableOpacity>
												);
											})}
										</View>
									</Field>
								);
							}}
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
