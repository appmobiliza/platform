import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

import ProfileLayout from "@/layout/profile";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

import { type ProfileEmailInput, ProfileEmailSchema } from "@/schemas";

export default function BasicProfileEmail() {
	const router = useRouter();

	const { email } = useLocalSearchParams<{ email?: string }>();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<ProfileEmailInput>({
		resolver: zodResolver(ProfileEmailSchema),
		defaultValues: {
			email: email ?? "",
		},
		mode: "onTouched",
	});

	// O e-mail é exibido apenas para consulta - não há endpoint para alterá-lo
	const handleSave = handleSubmit(() => {
		router.back();
	});

	return (
		<ProfileLayout
			title="E-mail"
			description="Este é seu endereço de e-mail principal, usado para contato e recuperação de conta."
			handleSave={handleSave}
		>
			<View className="gap-2">
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
								editable={false}
							/>
						</Field>
					)}
				/>
				<Text className="text-sm text-muted-foreground">
					O e-mail não pode ser alterado pelo aplicativo. Entre em
					contato com o suporte para alterá-lo.
				</Text>
			</View>
		</ProfileLayout>
	);
}
