import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import ProfileLayout from "@/layout/profile";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

export default function BasicProfileEmail() {
	const { email } = useLocalSearchParams<{ email?: string }>();

	return (
		<ProfileLayout
			title="E-mail"
			description="Este é seu endereço de e-mail principal, usado para contato e recuperação de conta."
		>
			<View className="gap-2">
				<Field label="E-mail">
					<Input
						placeholder="seu.email@exemplo.com"
						value={email ?? ""}
						autoCapitalize="none"
						autoCorrect={false}
						autoComplete="email"
						keyboardType="email-address"
						accessibilityLabel="E-mail"
						editable={false}
					/>
				</Field>
				<Text className="text-sm text-muted-foreground">
					O e-mail de sua conta é vinculado ao seu e-mail
					institucional. Entre em contato com o suporte caso seja
					necessário alterá-lo.
				</Text>
			</View>
		</ProfileLayout>
	);
}
