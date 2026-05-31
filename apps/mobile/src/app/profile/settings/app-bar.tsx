import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { Text } from "@/components/ui/text";

import { zodResolver } from "@/lib/zod-resolver";

import { type ProfilePhoneInput, ProfilePhoneSchema } from "@/schemas";

export default function AppBarSettings() {
	const router = useRouter();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<ProfilePhoneInput>({
		resolver: zodResolver(ProfilePhoneSchema),
		defaultValues: {
			phone: "",
		},
		mode: "onTouched",
	});

	const handleSave = handleSubmit(() => {
		router.back();
	});

	return (
		<View className="flex-1">
			<Header
				title="Barra de navegação"
				description="Escolha o estilo da barra de navegação para uma experiência personalizada."
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
					name="phone"
					render={({ field }) => (
						<SelectField
							label="Estilo da barra de navegação"
							description="Escolha entre o estilo padrão ou flutuante para a barra de navegação."
							error={errors.phone?.message}
							placeholder="Selecione um estilo"
							options={[
								{ label: "Padrão", value: "default" },
								{ label: "Flutuante", value: "floating" },
							]}
							value={field.value}
							onValueChange={field.onChange}
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
