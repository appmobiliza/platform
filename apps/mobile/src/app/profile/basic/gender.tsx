import { genderLabels, genderValues } from "@mobiliza/contracts";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollView, View } from "react-native";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { Text } from "@/components/ui/text";

import { useUserRole } from "@/lib/auth-store";
import { trpc } from "@/lib/trpc/client";

import { type ProfileGenderInput, ProfileGenderSchema } from "@/schemas";

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BasicProfileGender() {
	const router = useRouter();
	const role = useUserRole();
	const isScholar = role === "scholar";

	const { gender } = useLocalSearchParams<{ gender?: string }>();

	const updateStudent = trpc.profiles.updateStudent.useMutation();
	const updateScholar = trpc.profiles.updateScholar.useMutation();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<ProfileGenderInput>({
		resolver: zodResolver(ProfileGenderSchema),
		defaultValues: {
			gender: (gender as ProfileGenderInput["gender"]) || undefined,
		},
		mode: "onTouched",
	});

	const handleSave = handleSubmit(async (data) => {
		try {
			if (isScholar) {
				await updateScholar.mutateAsync({ gender: data.gender });
			} else {
				await updateStudent.mutateAsync({ gender: data.gender });
			}
			router.back();
		} catch (error) {
			console.error("Erro ao salvar gênero:", error);
			Alert.alert(
				"Erro",
				"Não foi possível salvar as alterações. Tente novamente.",
			);
		}
	});

	return (
		<View className="flex-1">
			<Header
				title="Gênero"
				description="Este é o gênero com o qual você se identifica."
			/>

			<ScrollView
				className="flex-1"
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={{
					paddingHorizontal: 16,
					paddingTop: 24,
					paddingBottom: 32,
				}}
			>
				<Controller
					control={control}
					name="gender"
					render={({ field }) => (
						<SelectField
							label="Gênero"
							description="Selecione o gênero com o qual você se identifica."
							value={field.value}
							placeholder="Selecionar gênero"
							options={genderValues.map((value) => ({
								value,
								label: genderLabels[value],
							}))}
							onValueChange={field.onChange}
							error={errors.gender?.message}
						/>
					)}
				/>

				<Button className="mt-8" onPress={handleSave}>
					<Text>Salvar alterações</Text>
				</Button>
			</ScrollView>
		</View>
	);
}
