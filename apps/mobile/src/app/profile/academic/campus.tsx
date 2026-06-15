import { campusValues } from "@mobiliza/contracts";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";

import ProfileLayout from "@/layout/profile";

import { SelectField } from "@/components/ui/select-field";
import { toast } from "@/components/ui/toast";

import { useUserRole } from "@/lib/auth/store";
import { trpc } from "@/lib/trpc/client";

import { type ProfileCampusInput, ProfileCampusSchema } from "@/schemas";

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AcademicProfileCampus() {
	const router = useRouter();
	const role = useUserRole();
	const isScholar = role === "scholar";

	const { campus } = useLocalSearchParams<{ campus?: string }>();

	const updateStudent = trpc.profiles.updateStudent.useMutation();
	const updateScholar = trpc.profiles.updateScholar.useMutation();
	const utils = trpc.useUtils();

	const isSaving = updateStudent.isPending || updateScholar.isPending;

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
	} = useForm<ProfileCampusInput>({
		resolver: zodResolver(ProfileCampusSchema),
		defaultValues: {
			campus: (campus as ProfileCampusInput["campus"]) || undefined,
		},
		mode: "onTouched",
	});

	const handleSave = handleSubmit(async (data) => {
		try {
			if (isScholar) {
				await updateScholar.mutateAsync({ campus: data.campus });
			} else {
				await updateStudent.mutateAsync({ campus: data.campus });
			}
			await utils.profiles.me.invalidate();
			reset(data);
			router.back();
		} catch (error) {
			console.error("Erro ao salvar campus:", error);
			toast.error(
				"Não foi possível salvar as alterações. Tente novamente.",
			);
		}
	});

	return (
		<ProfileLayout
			title="Campus"
			description="Selecione o campus da atual graduação que você está cursando"
			handleSave={handleSave}
			isSaving={isSaving}
			isDirty={isDirty}
		>
			<Controller
				control={control}
				name="campus"
				render={({ field }) => (
					<SelectField
						label="Campus"
						value={field.value}
						placeholder="Selecionar campus"
						options={campusValues.map((value) => ({
							label: value,
							value,
						}))}
						onValueChange={field.onChange}
						error={errors.campus?.message}
					/>
				)}
			/>
		</ProfileLayout>
	);
}
