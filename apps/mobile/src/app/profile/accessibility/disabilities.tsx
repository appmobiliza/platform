import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";

import ProfileLayout from "@/layout/profile-layout";

import BoxOptions from "@/components/box-options";
import { toast } from "@/components/ui/toast";

import { type RouterInputs, trpc } from "@/lib/trpc/client";

import {
	type ProfileDisabilitiesInput,
	ProfileDisabilitiesSchema,
} from "@/schemas";

// ─── Types ────────────────────────────────────────────────────────────────────

type UpdateStudentDisabilitiesInput = NonNullable<
	RouterInputs["profiles"]["updateStudent"]["disabilityTypes"]
>;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AccessibilityDisabilities() {
	const router = useRouter();

	const { disabilityTypes: disabilityTypesRaw } = useLocalSearchParams<{
		disabilityTypes?: string;
	}>();

	const updateStudent = trpc.profiles.updateStudent.useMutation();
	const utils = trpc.useUtils();

	const parsedDisabilityTypes = disabilityTypesRaw
		? (JSON.parse(
				disabilityTypesRaw,
			) as ProfileDisabilitiesInput["disabilityTypes"])
		: [];

	const isSaving = updateStudent.isPending;

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
	} = useForm<ProfileDisabilitiesInput>({
		resolver: zodResolver(ProfileDisabilitiesSchema),
		defaultValues: {
			disabilityTypes: parsedDisabilityTypes,
		},
		mode: "onTouched",
	});

	const handleSave = handleSubmit(async (data) => {
		try {
			await updateStudent.mutateAsync({
				disabilityTypes:
					data.disabilityTypes as UpdateStudentDisabilitiesInput,
			});
			await utils.profiles.me.invalidate();
			reset(data);
			router.back();
		} catch (error) {
			console.error("Erro ao salvar tipos de deficiência:", error);
			toast.error(
				"Não foi possível salvar as alterações. Tente novamente.",
			);
		}
	});

	return (
		<ProfileLayout
			title="Tipo de deficiência"
			description="Selecione uma ou mais opções com base em suas necessidades de acessibilidade"
			handleSave={handleSave}
			isSaving={isSaving}
			isDirty={isDirty}
		>
			<Controller
				control={control}
				name="disabilityTypes"
				render={({ field }) => (
					<BoxOptions
						value={field.value}
						onChange={field.onChange}
						error={errors.disabilityTypes?.message}
					/>
				)}
			/>
		</ProfileLayout>
	);
}
