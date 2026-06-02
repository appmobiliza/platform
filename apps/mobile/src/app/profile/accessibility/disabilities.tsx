import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";

import AccessibilityOptions from "@/components/accessibility-options";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import ProfileLayout from "@/layout/profile";
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
			disabilities: undefined,
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
		>
			<Controller
				control={control}
				name="disabilities"
				render={({ field }) => (
					<AccessibilityOptions
						value={field.value}
						onChange={field.onChange}
						error={errors.disabilities?.message}
					/>
				)}
			/>

			<Button className="mt-8" onPress={handleSave}>
				<Text>Salvar alterações</Text>
			</Button>
		</ProfileLayout>
	);
}
