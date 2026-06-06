import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert } from "react-native";

import ProfileLayout from "@/layout/profile";

import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

import { trpc } from "@/lib/trpc/client";

import {
	type ProfileObservationInput,
	ProfileObservationSchema,
} from "@/schemas";

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AccessibilityObservation() {
	const router = useRouter();

	const { attendanceNotes } = useLocalSearchParams<{
		attendanceNotes?: string;
	}>();

	const updateStudent = trpc.profiles.updateStudent.useMutation();
	const utils = trpc.useUtils();

	const isSaving = updateStudent.isPending;

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
	} = useForm<ProfileObservationInput>({
		resolver: zodResolver(ProfileObservationSchema),
		defaultValues: {
			attendanceNotes: attendanceNotes || undefined,
		},
		mode: "onTouched",
	});

	const handleSave = handleSubmit(async (data) => {
		try {
			await updateStudent.mutateAsync({
				attendanceNotes: data.attendanceNotes,
			});
			await utils.profiles.me.invalidate();
			reset(data);
			router.back();
		} catch (error) {
			console.error("Erro ao salvar observações:", error);
			Alert.alert(
				"Erro",
				"Não foi possível salvar as alterações. Tente novamente.",
			);
		}
	});

	return (
		<ProfileLayout
			title="Observações"
			description="Descreva suas observações sobre a acessibilidade do seu perfil"
			handleSave={handleSave}
			isSaving={isSaving}
			isDirty={isDirty}
		>
			<Controller
				control={control}
				name="attendanceNotes"
				render={({ field }) => (
					<Field
						label="Observações"
						error={errors.attendanceNotes?.message}
					>
						<Textarea
							placeholder="Digite suas observações aqui"
							value={field.value}
							onBlur={field.onBlur}
							onChangeText={field.onChange}
							autoCapitalize="sentences"
							autoComplete="name-given"
							accessibilityLabel="Observações"
							maxLength={255}
							aria-invalid={Boolean(errors.attendanceNotes)}
						/>
					</Field>
				)}
			/>
		</ProfileLayout>
	);
}
