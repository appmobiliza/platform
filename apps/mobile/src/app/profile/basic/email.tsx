import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";

import ProfileLayout from "@/layout/profile";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { type ProfileEmailInput, ProfileEmailSchema } from "@/schemas";

export default function BasicProfileEmail() {
	const router = useRouter();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<ProfileEmailInput>({
		resolver: zodResolver(ProfileEmailSchema),
		defaultValues: {
			email: "",
		},
		mode: "onTouched",
	});

	const handleSave = handleSubmit(() => {
		router.back();
	});

	return (
		<ProfileLayout
			title="E-mail"
			description="Este é seu endereço de e-mail principal, usado para contato e recuperação de conta."
			handleSave={handleSave}
		>
			<Controller
				control={control}
				name="email"
				render={({ field }) => (
					<Field label="E-mail" error={errors.email?.message}>
						<Input
							placeholder="seu.email@exemplo.com"
							value={field.value}
							onBlur={field.onBlur}
							onChangeText={field.onChange}
							autoCapitalize="none"
							autoCorrect={false}
							autoComplete="email"
							keyboardType="email-address"
							accessibilityLabel="E-mail"
							aria-invalid={Boolean(errors.email)}
						/>
					</Field>
				)}
			/>
		</ProfileLayout>
	);
}
