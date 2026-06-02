import { studentShiftValues } from "@mobiliza/contracts";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";

import ProfileLayout from "@/layout/profile";

import { SelectField } from "@/components/ui/select-field";

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
			shift: "afternoon",
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
			handleSave={handleSave}
		>
			<Controller
				control={control}
				name="shift"
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
						error={errors.shift?.message}
					/>
				)}
			/>
		</ProfileLayout>
	);
}
