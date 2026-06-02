import { zodResolver } from "@hookform/resolvers/zod";
import { campusValues } from "@mobiliza/contracts";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { Text } from "@/components/ui/text";

import ProfileLayout from "@/layout/profile";
import { type ProfileCampusInput, ProfileCampusSchema } from "@/schemas";

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AcademicProfileCampus() {
	const router = useRouter();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<ProfileCampusInput>({
		resolver: zodResolver(ProfileCampusSchema),
		defaultValues: {
			campus: undefined,
		},
		mode: "onTouched",
	});

	const handleSave = handleSubmit(() => {
		router.back();
	});

	return (
		<ProfileLayout
			title="Campus"
			description="Selecione seu atual campus de graduação."
		>
			<Controller
				control={control}
				name="campus"
				render={({ field }) => (
					<SelectField
						label="Campus"
						description="Selecione o campus de graduação que você está cursando."
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

			<Button className="mt-8" onPress={handleSave}>
				<Text>Salvar alterações</Text>
			</Button>
		</ProfileLayout>
	);
}
