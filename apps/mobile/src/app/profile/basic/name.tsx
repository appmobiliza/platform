import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

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
		<View className="flex-1">
			<Header
				title="Nome e apelido"
				description="Defina seu nome e como quer que outras pessoas se referiram a você"
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
				<View className="gap-4">
					<Controller
						control={control}
						name="name"
						render={({ field }) => (
							<Field
								label="Nome"
								description="Digite apenas o primeiro nome."
								error={errors.name?.message}
							>
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
							<Field
								label="Apelido"
								description="Digite um apelido"
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
				</View>

				<Button className="mt-8" onPress={handleSave}>
					<Text>Salvar alterações</Text>
				</Button>
			</ScrollView>
		</View>
	);
}
