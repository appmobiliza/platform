import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert } from "react-native";

import ProfileLayout from "@/layout/profile";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { useUserRole } from "@/lib/auth-store";
import { trpc } from "@/lib/trpc/client";

import {
	type ProfileEnrollmentInput,
	ProfileEnrollmentSchema,
} from "@/schemas";

export default function BasicProfileEnrollment() {
	const router = useRouter();
	const role = useUserRole();
	const isScholar = role === "scholar";

	const { enrollment } = useLocalSearchParams<{ enrollment?: string }>();

	const updateStudent = trpc.profiles.updateStudent.useMutation();
	const updateScholar = trpc.profiles.updateScholar.useMutation();
	const utils = trpc.useUtils();

	const isSaving = updateStudent.isPending || updateScholar.isPending;

	const {
		control,
		handleSubmit,
		formState: { errors, isDirty },
	} = useForm<ProfileEnrollmentInput>({
		resolver: zodResolver(ProfileEnrollmentSchema),
		defaultValues: {
			enrollment: enrollment ?? "",
		},
		mode: "onTouched",
	});

	const handleSave = handleSubmit(async (data) => {
		try {
			if (isScholar) {
				await updateScholar.mutateAsync({
					enrollment: data.enrollment,
				});
			} else {
				await updateStudent.mutateAsync({
					enrollment: data.enrollment,
				});
			}
			await utils.profiles.me.invalidate();
			router.back();
		} catch (error) {
			console.error("Erro ao salvar matrícula:", error);
			Alert.alert(
				"Erro",
				"Não foi possível salvar as alterações. Tente novamente.",
			);
		}
	});

	return (
		<ProfileLayout
			title="Número da Matrícula"
			description="Este é seu número de matrícula, usado para identificação e registro."
			handleSave={handleSave}
			isSaving={isSaving}
			isDirty={isDirty}
		>
			<Controller
				control={control}
				name="enrollment"
				render={({ field }) => (
					<Field
						label="Matrícula"
						description="Use o número cadastrado no documento oficial."
						error={errors.enrollment?.message}
					>
						<Input
							placeholder="XXXXXXXX"
							value={field.value}
							onBlur={field.onBlur}
							onChangeText={field.onChange}
							autoComplete="off"
							keyboardType="numeric"
							accessibilityLabel="Matrícula"
							aria-invalid={Boolean(errors.enrollment)}
						/>
					</Field>
				)}
			/>
		</ProfileLayout>
	);
}
