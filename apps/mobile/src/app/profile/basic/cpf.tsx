import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { MaskedInput } from "@/components/ui/masked-input";
import { Text } from "@/components/ui/text";

import { zodResolver } from "@/lib/zod-resolver";

import { type ProfileCpfInput, ProfileCpfSchema } from "@/schemas";

export default function BasicProfileCpf() {
	const router = useRouter();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<ProfileCpfInput>({
		resolver: zodResolver(ProfileCpfSchema),
		defaultValues: {
			cpf: "",
		},
		mode: "onTouched",
	});

	const handleSave = handleSubmit(() => {
		router.back();
	});

	return (
		<View className="flex-1">
			<Header
				title="Número do CPF"
				description="Este é seu número de CPF, usado para identificação e registro."
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
					name="cpf"
					render={({ field }) => (
						<Field
							label="CPF"
							description="Use o número cadastrado no documento oficial."
							error={errors.cpf?.message}
						>
							<MaskedInput
								mask="cpf"
								placeholder="000.000.000-00"
								value={field.value}
								onBlur={field.onBlur}
								onChangeText={field.onChange}
								autoComplete="off"
								accessibilityLabel="CPF"
								aria-invalid={Boolean(errors.cpf)}
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
