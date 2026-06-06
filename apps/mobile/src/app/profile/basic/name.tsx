import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert, View } from "react-native";

import ProfileLayout from "@/layout/profile";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { useUserRole } from "@/lib/auth-store";
import { trpc } from "@/lib/trpc/client";

import { type ProfileNameInput, ProfileNameSchema } from "@/schemas";

export default function BasicProfileName() {
	const router = useRouter();
	const role = useUserRole();
	const isScholar = role === "scholar";

	const { name, nickname } = useLocalSearchParams<{
		name: string;
		nickname?: string;
	}>();

	const updateStudent = trpc.profiles.updateStudent.useMutation();
	const updateScholar = trpc.profiles.updateScholar.useMutation();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<ProfileNameInput>({
		resolver: zodResolver(ProfileNameSchema),
		defaultValues: {
			name: name ?? "",
			nickname: nickname ?? "",
		},
		mode: "onTouched",
	});

	const handleSave = handleSubmit(async (data) => {
		try {
			if (isScholar) {
				await updateScholar.mutateAsync({ name: data.name });
			} else {
				await updateStudent.mutateAsync({
					name: data.name,
					nickname: data.nickname || undefined,
				});
			}
			router.back();
		} catch (error) {
			console.error("Erro ao salvar nome:", error);
			Alert.alert(
				"Erro",
				"Não foi possível salvar as alterações. Tente novamente.",
			);
		}
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

				{!isScholar && (
					<Controller
						control={control}
						name="nickname"
						render={({ field }) => (
							<Field
								label="Apelido"
								error={errors.nickname?.message}
							>
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
				)}
			</View>
		</ProfileLayout>
	);
}
