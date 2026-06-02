import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

import {
	type ProfileEnrollmentInput,
	ProfileEnrollmentSchema,
} from "@/schemas";

export default function BasicProfileEnrollment() {
	const router = useRouter();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<ProfileEnrollmentInput>({
		resolver: zodResolver(ProfileEnrollmentSchema),
		defaultValues: {
			enrollment: "",
		},
		mode: "onTouched",
	});

	const handleSave = handleSubmit(() => {
		router.back();
	});

	return (
		<View className="flex-1">
			<Header
				title="Número da Matrícula"
				description="Este é seu número de matrícula, usado para identificação e registro."
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
					name="enrollment"
					render={({ field }) => (
						<Field
							label="Matrícula"
							description="Use o número cadastrado no documento oficial."
							error={errors.enrollment?.message}
						>
							<Input
								placeholder="XXXXXXXX"
								value={field.value}
								onBlur={field.onBlur}
								onChangeText={field.onChange}
								autoComplete="off"
								accessibilityLabel="Matrícula"
								aria-invalid={Boolean(errors.enrollment)}
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
