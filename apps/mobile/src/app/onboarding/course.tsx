import { useState } from "react";
import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { Button } from "../../components/ui/Button";
import { Header } from "../../components/ui/Header";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { StepIndicator } from "../../components/ui/StepIndicator";

import { courseOptions, shiftOptions, campusOptions } from "@/constants";
import { CourseInfoSchema, type CourseInfoInput } from "@/schemas";

export default function CourseInfo() {
	const router = useRouter();

	const [course, setCourse] = useState("");
	const [shift, setShift] = useState("");
	const [campus, setCampus] = useState("");
	const [matricula, setMatricula] = useState("");
	const [errors, setErrors] = useState<Partial<Record<keyof CourseInfoInput, string>>>({});

	const steps = [
		{ id: "basic", title: "Dados Básicos" },
		{ id: "course", title: "Universidade" },
		{ id: "accessibility", title: "Acessibilidade" },
	];

	const handleContinue = () => {
		const data: CourseInfoInput = { course, shift, campus, matricula };
		const result = CourseInfoSchema.safeParse(data);

		if (!result.success) {
			const fieldErrors: Partial<Record<keyof CourseInfoInput, string>> = {};
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
					Vamos fazer algumas poucas perguntas rápidas
				</Text>

				<StepIndicator steps={steps} currentStepId="course" />

				<View className="mt-8 space-y-4 gap-4">
					<Select
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
					/>

					<Input
						label="Matrícula"
						placeholder="23415364"
						keyboardType="numeric"
						value={matricula}
						onChangeText={setMatricula}
						error={errors.matricula}
					/>
				</View>

				<Button className="mt-8" onPress={handleContinue}>
					Continuar
				</Button>
			</ScrollView>
		</View>
	);
}
