import { courseValues } from "@mobiliza/contracts";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";

import ProfileLayout from "@/layout/profile";

import { SelectField } from "@/components/ui/select-field";

import { type ProfileCourseInput, ProfileCourseSchema } from "@/schemas";

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AcademicProfileCourse() {
	const router = useRouter();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<ProfileCourseInput>({
		resolver: zodResolver(ProfileCourseSchema),
		defaultValues: {
			course: "Ciência da Computação",
		},
		mode: "onTouched",
	});

	const handleSave = handleSubmit(() => {
		router.back();
	});

	return (
		<ProfileLayout
			title="Curso"
			description="Selecione seu atual curso de graduação."
			handleSave={handleSave}
		>
			<Controller
				control={control}
				name="course"
				render={({ field }) => (
					<SelectField
						label="Curso"
						description="Selecione o curso de graduação que você está cursando."
						value={field.value}
						placeholder="Selecionar curso"
						options={courseValues.map((value) => ({
							label: value,
							value,
						}))}
						onValueChange={field.onChange}
						error={errors.course?.message}
					/>
				)}
			/>
		</ProfileLayout>
	);
}
