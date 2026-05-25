import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

import { zodResolver } from "@/lib/zod-resolver";

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
			firstName: "",
			lastName: "",
		},
		mode: "onTouched",
	});

	const handleSave = handleSubmit(() => {
		router.back();
	});

	return (
		<View className="flex-1">
			<Header
				title="Nome"
				description="Este é o nome que você quer que outras pessoas usem quando se referirem a você"
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
						name="firstName"
						render={({ field }) => (
							<Field
								label="Nome"
								description="Digite apenas o primeiro nome."
								error={errors.firstName?.message}
							>
								<Input
									placeholder="Fulano"
									value={field.value}
									onBlur={field.onBlur}
									onChangeText={field.onChange}
									autoCapitalize="words"
									autoComplete="name-given"
									accessibilityLabel="Nome"
									aria-invalid={Boolean(errors.firstName)}
								/>
							</Field>
						)}
					/>

					<Controller
						control={control}
						name="lastName"
						render={({ field }) => (
							<Field
								label="Sobrenome"
								description="Digite o sobrenome principal."
								error={errors.lastName?.message}
							>
								<Input
									placeholder="da Silva"
									value={field.value}
									onBlur={field.onBlur}
									onChangeText={field.onChange}
									autoCapitalize="words"
									autoComplete="name-family"
									accessibilityLabel="Sobrenome"
									aria-invalid={Boolean(errors.lastName)}
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
