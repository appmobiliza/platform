import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

import { zodResolver } from "@/lib/zod-resolver";

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
		<View className="flex-1">
			<Header
				title="E-mail"
				description="Este é seu endereço de e-mail principal, usado para contato e recuperação de conta."
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
					name="email"
					render={({ field }) => (
						<Field
							label="E-mail"
							description="Esse endereço será usado para contato e recuperação de conta."
							error={errors.email?.message}
						>
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

				<Button className="mt-8" onPress={handleSave}>
					<Text>Salvar alterações</Text>
				</Button>
			</ScrollView>
		</View>
	);
}
