import { zodResolver } from "@hookform/resolvers/zod";
import { studentShiftValues } from "@mobiliza/contracts";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { Text } from "@/components/ui/text";

import ProfileLayout from "@/layout/profile";
import {
	type ProfileStudentShiftInput,
	ProfileStudentShiftSchema,
} from "@/schemas";

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AcademicProfileShift() {
	const router = useRouter();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<ProfileStudentShiftInput>({
		resolver: zodResolver(ProfileStudentShiftSchema),
		defaultValues: {
			studentShift: "afternoon",
		},
		mode: "onTouched",
	});

	const handleSave = handleSubmit(() => {
		router.back();
	});

	return (
		<ProfileLayout
			title="Turma"
			description="Selecione sua turma de graduação."
		>
			<Controller
				control={control}
				name="studentShift"
				render={({ field }) => (
					<SelectField
						label="Turma"
						description="Selecione a turma de graduação que você está cursando."
						value={field.value}
						placeholder="Selecionar turma"
						options={studentShiftValues.map((value) => ({
							label: value,
							value,
						}))}
						onValueChange={field.onChange}
						error={errors.studentShift?.message}
					/>
				)}
			/>

			<Button className="mt-8" onPress={handleSave}>
				<Text>Salvar alterações</Text>
			</Button>
		</ProfileLayout>
	);
}
