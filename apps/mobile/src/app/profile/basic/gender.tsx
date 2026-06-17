import { genderLabels, genderValues } from "@mobiliza/contracts";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";

import ProfileLayout from "@/layout/profile-layout";

import { SelectField } from "@/components/ui/select-field";
import { toast } from "@/components/ui/toast";

import { useUserRole } from "@/lib/auth/store";
import { trpc } from "@/lib/trpc/client";

import { type ProfileGenderInput, ProfileGenderSchema } from "@/schemas";

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BasicProfileGender() {
	const router = useRouter();
	const role = useUserRole();
	const isScholar = role === "scholar";

	const { gender } = useLocalSearchParams<{ gender?: string }>();

	const updateStudent = trpc.profiles.updateStudent.useMutation();
	const updateScholar = trpc.profiles.updateScholar.useMutation();
	const utils = trpc.useUtils();

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
	} = useForm<ProfileGenderInput>({
		resolver: zodResolver(ProfileGenderSchema),
		defaultValues: {
			gender: (gender as ProfileGenderInput["gender"]) || undefined,
		},
		mode: "onTouched",
	});

	const isSaving = updateStudent.isPending || updateScholar.isPending;

	const handleSave = handleSubmit(async (data) => {
		try {
			if (isScholar) {
				await updateScholar.mutateAsync({ gender: data.gender });
			} else {
				await updateStudent.mutateAsync({ gender: data.gender });
			}
			await utils.profiles.me.invalidate();
			reset(data);
			router.back();
		} catch (error) {
			console.error("Erro ao salvar gênero:", error);
			toast.error(
				"Não foi possível salvar as alterações. Tente novamente.",
			);
		}
	});

	return (
		<ProfileLayout
			title="Gênero"
			description="Este é o gênero com o qual você se identifica."
			handleSave={handleSave}
			isSaving={isSaving}
			isDirty={isDirty}
		>
			<Controller
				control={control}
				name="gender"
				render={({ field }) => (
					<SelectField
						label="Gênero"
						description="Selecione o gênero com o qual você se identifica."
						value={field.value}
						placeholder="Selecionar gênero"
						options={genderValues.map((value) => ({
							value,
							label: genderLabels[value],
						}))}
						onValueChange={field.onChange}
						error={errors.gender?.message}
					/>
				)}
			/>
		</ProfileLayout>
	);
}
