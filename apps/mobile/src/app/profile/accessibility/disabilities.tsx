import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";

import ProfileLayout from "@/layout/profile";

import BoxOptions from "@/components/box-options";

import {
	type ProfileDisabilitiesInput,
	ProfileDisabilitiesSchema,
} from "@/schemas";

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AcademicProfileCourse() {
	const router = useRouter();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<ProfileDisabilitiesInput>({
		resolver: zodResolver(ProfileDisabilitiesSchema),
		defaultValues: {
			disabilityTypes: undefined,
		},
		mode: "onTouched",
	});

	const handleSave = handleSubmit(() => {
		router.back();
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
