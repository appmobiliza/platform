import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";

import ProfileLayout from "@/layout/profile";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import {
	type ProfileEnrollmentInput,
	ProfileEnrollmentSchema,
} from "@/schemas";

export default function BasicProfileEnrollment() {
	const router = useRouter();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<ProfileEnrollmentInput>({
		resolver: zodResolver(ProfileEnrollmentSchema),
		defaultValues: {
			enrollment: "",
		},
		mode: "onTouched",
	});

	const handleSave = handleSubmit(() => {
		router.back();
	});

	return (
		<ProfileLayout
			title="Número da Matrícula"
			description="Este é seu número de matrícula, usado para identificação e registro."
			handleSave={handleSave}
		>
			<Controller
				control={control}
				name="enrollment"
				render={({ field }) => (
					<Field
						label="Matrícula"
						description="Use o número cadastrado no documento oficial."
						error={errors.enrollment?.message}
					>
						<Input
							placeholder="XXXXXXXX"
							value={field.value}
							onBlur={field.onBlur}
							onChangeText={field.onChange}
							autoComplete="off"
							accessibilityLabel="Matrícula"
							aria-invalid={Boolean(errors.enrollment)}
						/>
					</Field>
				)}
			/>
		</ProfileLayout>
	);
}
