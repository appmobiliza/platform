import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";

import ProfileLayout from "@/layout/profile";

import { SelectField } from "@/components/ui/select-field";

import { type ProfilePhoneInput, ProfilePhoneSchema } from "@/schemas";

export default function SettingsProfileAppBar() {
	const router = useRouter();

	const {
		control,
		handleSubmit,
		formState: { errors, isDirty },
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
		<ProfileLayout
			title="Barra de navegação"
			description="Escolha o estilo da barra de navegação para uma experiência personalizada."
			handleSave={handleSave}
			isDirty={isDirty}
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
		</ProfileLayout>
	);
}
