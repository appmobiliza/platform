import { courseValues } from "@mobiliza/contracts";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

import ProfileLayout from "@/layout/profile";

import { SelectField } from "@/components/ui/select-field";

import { type ProfileCourseInput, ProfileCourseSchema } from "@/schemas";

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

	// ⚡️ PERFORMANCE FIX: Memoize the data conversion so it never runs during form re-renders
	const courseOptions = useMemo(() => {
		return courseValues.map((value) => ({
			label: value,
			value,
		}));
	}, []);

	return (
		<ProfileLayout
			title="Curso"
			description="Selecione o curso de graduação que você está cursando no momento"
			handleSave={handleSave}
		>
			<Controller
				control={control}
				name="course"
				render={({ field }) => (
					<SelectField
						label="Curso"
						value={field.value}
						placeholder="Selecionar curso"
						options={courseOptions}
						onValueChange={field.onChange}
						error={errors.course?.message}
						searchable
					/>
				)}
			/>
		</ProfileLayout>
	);
}
