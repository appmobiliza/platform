import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";

import ProfileLayout from "@/layout/profile";
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
			observation: undefined,
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
		>
			<Controller
				control={control}
				name="observation"
				render={({ field }) => (
					<Field
						label="Observações"
						error={errors.observation?.message}
					>
						<Textarea
							placeholder="Digite suas observações aqui"
							value={field.value}
							onBlur={field.onBlur}
							onChangeText={field.onChange}
							autoCapitalize="sentences"
							autoComplete="name-given"
							accessibilityLabel="Nome"
							aria-invalid={Boolean(errors.observation)}
						/>
					</Field>
				)}
			/>

			<Button className="mt-8" onPress={handleSave}>
				<Text>Salvar alterações</Text>
			</Button>
		</ProfileLayout>
	);
}
