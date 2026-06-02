import { zodResolver } from "@hookform/resolvers/zod";
import { campusValues, courseValues, studentShiftValues } from "@mobiliza/db";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";

import { Header } from "@/components/header";
import { StepIndicator } from "@/components/step-indicator";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Text } from "@/components/ui/text";

import { onboardingSteps } from "@/constants/onboarding";
import { type CourseInfoInput, CourseInfoSchema } from "@/schemas";

export default function CourseInfo() {
	const router = useRouter();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<CourseInfoInput>({
		resolver: zodResolver(CourseInfoSchema),
		defaultValues: {
			course: undefined,
			studentShift: undefined,
			campus: undefined,
			enrollment: "",
		},
		mode: "onTouched",
	});

	const handleContinue = handleSubmit(() => {
		router.push("/onboarding/accessibility");
	});

	return (
		<View className="flex-1">
			<Header title="Cadastrar-se no Mobiliza" size="small" />

			<ScrollView
				className="flex-1"
				contentContainerClassName="px-4"
				keyboardShouldPersistTaps="handled"
			>
				{/* <Text className="mb-2 mt-2 text-2xl font-bold">
					Cadastrar-se no Mobiliza
				</Text> */}
				<Text className="mb-6 text-base leading-relaxed text-muted-foreground">
					Agora, vamos fazer algumas perguntas rápidas sobre sua
					relação com a universidade
				</Text>

				<StepIndicator steps={onboardingSteps} currentStepId="course" />

				<View className="mt-8 gap-4">
					<Controller
						control={control}
						name="course"
						render={({ field }) => (
							<SelectField
								label="Curso"
								description="Selecione o curso em que você está matriculado."
								value={field.value}
								placeholder="Selecione o curso"
								options={courseValues.map((value) => ({
									value,
									label: value,
								}))}
								onValueChange={field.onChange}
								error={errors.course?.message}
							/>
						)}
					/>

					<Controller
						control={control}
						name="studentShift"
						render={({ field }) => (
							<SelectField
								label="Turno"
								description="Escolha o turno principal das suas aulas."
								value={field.value}
								placeholder="Selecione o turno"
								options={studentShiftValues.map((value) => ({
									value,
									label: value,
								}))}
								onValueChange={field.onChange}
								error={errors.studentShift?.message}
							/>
						)}
					/>

					<Controller
						control={control}
						name="campus"
						render={({ field }) => (
							<SelectField
								label="Campus"
								description="Selecione o campus onde você estuda."
								value={field.value}
								placeholder="Selecione o campus"
								options={campusValues.map((value) => ({
									value,
									label: value,
								}))}
								onValueChange={field.onChange}
								error={errors.campus?.message}
							/>
						)}
					/>

					<Controller
						control={control}
						name="enrollment"
						render={({ field }) => (
							<Field
								label="Matrícula"
								description="Digite a matrícula usada pela universidade."
								error={errors.enrollment?.message}
							>
								<Input
									placeholder="23415364"
									keyboardType="number-pad"
									value={field.value}
									onBlur={field.onBlur}
									onChangeText={field.onChange}
									autoComplete="off"
									autoCapitalize="none"
									maxLength={20}
									autoCorrect={false}
									accessibilityLabel="Matrícula"
									aria-invalid={Boolean(errors.enrollment)}
								/>
							</Field>
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
