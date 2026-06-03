import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

import ProfileLayout from "@/layout/profile";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { type ProfileNameInput, ProfileNameSchema } from "@/schemas";

export default function BasicProfileName() {
	const router = useRouter();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<ProfileNameInput>({
		resolver: zodResolver(ProfileNameSchema),
		defaultValues: {
			name: "",
			nickname: "",
		},
		mode: "onTouched",
	});

	const handleSave = handleSubmit(() => {
		router.back();
	});

	return (
		<ProfileLayout
			title="Nome e apelido"
			description="Defina seu nome e como quer que outras pessoas se referiram a você"
			handleSave={handleSave}
		>
			<View className="gap-4">
				<Controller
					control={control}
					name="name"
					render={({ field }) => (
						<Field label="Nome" error={errors.name?.message}>
							<Input
								placeholder="Fulano"
								value={field.value}
								onBlur={field.onBlur}
								onChangeText={field.onChange}
								autoCapitalize="words"
								autoComplete="name-given"
								accessibilityLabel="Nome"
								aria-invalid={Boolean(errors.name)}
							/>
						</Field>
					)}
				/>

				<Controller
					control={control}
					name="nickname"
					render={({ field }) => (
						<Field label="Apelido" error={errors.nickname?.message}>
							<Input
								placeholder="Apelido (opcional)"
								value={field.value}
								onBlur={field.onBlur}
								onChangeText={field.onChange}
								autoCapitalize="words"
								autoComplete="name-family"
								accessibilityLabel="Apelido"
								aria-invalid={Boolean(errors.nickname)}
							/>
						</Field>
					)}
				/>
			</View>
		</ProfileLayout>
	);
}
