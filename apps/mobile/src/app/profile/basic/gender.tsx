import { zodResolver } from "@hookform/resolvers/zod";
import { genderValues } from "@mobiliza/contracts";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { Text } from "@/components/ui/text";

import { type ProfileGenderInput, ProfileGenderSchema } from "@/schemas";

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BasicProfileGender() {
	const router = useRouter();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<ProfileGenderInput>({
		resolver: zodResolver(ProfileGenderSchema),
		defaultValues: {
			gender: "Masculino",
		},
		mode: "onTouched",
	});

	const handleSave = handleSubmit(() => {
		router.back();
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
								label: value,
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
