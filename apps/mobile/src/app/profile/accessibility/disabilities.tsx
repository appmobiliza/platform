import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert } from "react-native";

import ProfileLayout from "@/layout/profile";

import BoxOptions from "@/components/box-options";

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

	const parsedDisabilityTypes = disabilityTypesRaw
		? (JSON.parse(
				disabilityTypesRaw,
			) as ProfileDisabilitiesInput["disabilityTypes"])
		: [];

	const {
		control,
		handleSubmit,
		formState: { errors },
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
			router.back();
		} catch (error) {
			console.error("Erro ao salvar tipos de deficiência:", error);
			Alert.alert(
				"Erro",
				"Não foi possível salvar as alterações. Tente novamente.",
			);
		}
	});

	return (
		<ProfileLayout
			title="Tipo de deficiência"
			description="Selecione uma ou mais opções com base em suas necessidades de acessibilidade"
			handleSave={handleSave}
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
