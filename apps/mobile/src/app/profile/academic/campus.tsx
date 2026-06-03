import { campusValues } from "@mobiliza/contracts";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";

import ProfileLayout from "@/layout/profile";

import { SelectField } from "@/components/ui/select-field";

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
			description="Selecione o campus da atual graduação que você está cursando"
			handleSave={handleSave}
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
