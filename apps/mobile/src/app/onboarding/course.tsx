import { useState } from "react";

import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

import { campusOptions, courseOptions, shiftOptions } from "@/constants";
import { type CourseInfoInput, CourseInfoSchema } from "@/schemas";

import { StepIndicator } from "../../components/step-indicator";

export default function CourseInfo() {
	const router = useRouter();

	const [course, setCourse] = useState("");
	const [shift, setShift] = useState("");
	const [campus, setCampus] = useState("");
	const [matricula, setMatricula] = useState("");
	const [errors, setErrors] = useState<
		Partial<Record<keyof CourseInfoInput, string>>
	>({});

	const steps = [
		{ id: "basic", title: "Dados Básicos" },
		{ id: "course", title: "Universidade" },
		{ id: "accessibility", title: "Acessibilidade" },
	];

	const handleContinue = () => {
		const data: CourseInfoInput = { course, shift, campus, matricula };
		const result = CourseInfoSchema.safeParse(data);

		if (!result.success) {
			const fieldErrors: Partial<Record<keyof CourseInfoInput, string>> =
				{};
			result.error.issues.forEach((issue) => {
				const field = issue.path[0] as keyof CourseInfoInput;
				fieldErrors[field] = issue.message;
			});
			setErrors(fieldErrors);
			return;
		}

		setErrors({});
		router.push("/onboarding/accessibility");
	};

	return (
		<View className="flex-1">
			<Header title="Cadastrar-se no Mobiliza" />

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
					Vamos fazer algumas poucas perguntas rápidas
				</Text>

				<StepIndicator steps={steps} currentStepId="course" />

				<View className="mt-8 space-y-4 gap-4">
					{/* <Select
						label="Curso"
						value={course}
						onSelect={setCourse}
						options={courseOptions}
						placeholder="Selecione o curso"
						error={errors.course}
					/>

					<Select
						label="Turno"
						value={shift}
						onSelect={setShift}
						options={shiftOptions}
						placeholder="Selecione o turno"
						error={errors.shift}
					/>

					<Select
						label="Campus"
						value={campus}
						onSelect={setCampus}
						options={campusOptions}
						placeholder="Selecione o campus"
						error={errors.campus}
					/> */}

					<Field label="Matrícula">
						<Input
							placeholder="23415364"
							keyboardType="numeric"
							value={matricula}
							onChangeText={setMatricula}
							// error={errors.matricula}
						/>
					</Field>
				</View>

				<Button className="mt-8" onPress={handleContinue}>
					<Text>Continuar</Text>
				</Button>
			</ScrollView>
		</View>
	);
}
