import {
	scholarShiftLabels,
	scholarShiftValues,
	studentShiftLabels,
	studentShiftValues,
} from "@mobiliza/contracts";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert } from "react-native";

import ProfileLayout from "@/layout/profile";

import { SelectField } from "@/components/ui/select-field";

import { useUserRole } from "@/lib/auth-store";
import { type RouterInputs, trpc } from "@/lib/trpc/client";

import {
	type ProfileStudentShiftInput,
	ProfileStudentShiftSchema,
} from "@/schemas";

// ─── Types ────────────────────────────────────────────────────────────────────

type UpdateScholarShiftInput = NonNullable<
	RouterInputs["profiles"]["updateScholar"]["shift"]
>;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AcademicProfileShift() {
	const router = useRouter();
	const role = useUserRole();
	const isScholar = role === "scholar";

	const { shift } = useLocalSearchParams<{ shift?: string }>();

	const updateStudent = trpc.profiles.updateStudent.useMutation();
	const updateScholar = trpc.profiles.updateScholar.useMutation();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<ProfileStudentShiftInput>({
		resolver: zodResolver(ProfileStudentShiftSchema),
		defaultValues: {
			shift: (shift as ProfileStudentShiftInput["shift"]) || undefined,
		},
		mode: "onTouched",
	});

	const handleSave = handleSubmit(async (data) => {
		try {
			if (isScholar) {
				await updateScholar.mutateAsync({
					shift: data.shift as UpdateScholarShiftInput,
				});
			} else {
				await updateStudent.mutateAsync({ shift: data.shift });
			}
			router.back();
		} catch (error) {
			console.error("Erro ao salvar turno:", error);
			Alert.alert(
				"Erro",
				"Não foi possível salvar as alterações. Tente novamente.",
			);
		}
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
						options={
							isScholar
								? scholarShiftValues.map((value) => ({
										label: scholarShiftLabels[value],
										value,
									}))
								: studentShiftValues.map((value) => ({
										label: studentShiftLabels[value],
										value,
									}))
						}
						onValueChange={field.onChange}
						error={errors.shift?.message}
					/>
				)}
			/>
		</ProfileLayout>
	);
}
