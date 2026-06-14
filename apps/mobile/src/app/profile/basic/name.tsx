import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

import ProfileLayout from "@/layout/profile";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

import { cacheUserInfo, useUserRole } from "@/lib/auth-store";
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
	const utils = trpc.useUtils();

	const isSaving = updateStudent.isPending || updateScholar.isPending;

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
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
			await utils.profiles.me.invalidate();

			// Refetch the full user data and update the MMKV cache so that
			// the profile tab (which reads from the auth store, not TRPC)
			// reflects the updated name immediately
			const freshUser = await utils.profiles.me.fetch();
			cacheUserInfo({
				id: freshUser.id,
				name: freshUser.name,
				email: freshUser.email,
				image: freshUser.image,
				role: freshUser.role,
			});

			reset(data);
			router.back();
		} catch (error) {
			console.error("Erro ao salvar nome:", error);
			toast.error(
				"Não foi possível salvar as alterações. Tente novamente.",
			);
		}
	});

	return (
		<ProfileLayout
			title="Nome e apelido"
			description="Defina seu nome e como quer que outras pessoas se referiram a você"
			handleSave={handleSave}
			isSaving={isSaving}
			isDirty={isDirty}
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
