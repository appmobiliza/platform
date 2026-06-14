import { courseValues } from "@mobiliza/contracts";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

import ProfileLayout from "@/layout/profile";

import { SelectField } from "@/components/ui/select-field";
import { toast } from "@/components/ui/toast";

import { useUserRole } from "@/lib/auth-store";
import { trpc } from "@/lib/trpc/client";

import { type ProfileCourseInput, ProfileCourseSchema } from "@/schemas";

export default function AcademicProfileCourse() {
	const router = useRouter();
	const role = useUserRole();
	const isScholar = role === "scholar";

	const { course } = useLocalSearchParams<{ course?: string }>();

	const updateStudent = trpc.profiles.updateStudent.useMutation();
	const updateScholar = trpc.profiles.updateScholar.useMutation();
	const utils = trpc.useUtils();

	const isSaving = updateStudent.isPending || updateScholar.isPending;

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
	} = useForm<ProfileCourseInput>({
		resolver: zodResolver(ProfileCourseSchema),
		defaultValues: {
			course: (course as ProfileCourseInput["course"]) || undefined,
		},
		mode: "onTouched",
	});

	const handleSave = handleSubmit(async (data) => {
		try {
			if (isScholar) {
				await updateScholar.mutateAsync({ course: data.course });
			} else {
				await updateStudent.mutateAsync({ course: data.course });
			}
			await utils.profiles.me.invalidate();
			reset(data);
			router.back();
		} catch (error) {
			console.error("Erro ao salvar curso:", error);
			toast.error(
				"Não foi possível salvar as alterações. Tente novamente.",
			);
		}
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
			isSaving={isSaving}
			isDirty={isDirty}
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
