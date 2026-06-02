import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";

import ProfileLayout from "@/layout/profile";

import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

import {
	type ProfileObservationInput,
	ProfileObservationSchema,
} from "@/schemas";

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AcademicProfileCourse() {
	const router = useRouter();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<ProfileObservationInput>({
		resolver: zodResolver(ProfileObservationSchema),
		defaultValues: {
			attendanceNotes: undefined,
		},
		mode: "onTouched",
	});

	const handleSave = handleSubmit(() => {
		router.back();
	});

	return (
		<ProfileLayout
			title="Observações"
			description="Descreva suas observações sobre a acessibilidade do seu perfil"
			handleSave={handleSave}
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
							accessibilityLabel="Nome"
							aria-invalid={Boolean(errors.attendanceNotes)}
						/>
					</Field>
				)}
			/>
		</ProfileLayout>
	);
}
