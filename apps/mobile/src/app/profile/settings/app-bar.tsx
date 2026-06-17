import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

import ProfileLayout from "@/layout/profile-layout";

import { SelectField } from "@/components/ui/select-field";

const appBarSchema = z.object({
	schema: z.enum(["default", "native"]),
});

type AppBarSchema = z.infer<typeof appBarSchema>;

export default function SettingsProfileAppBar() {
	const router = useRouter();

	const {
		control,
		handleSubmit,
		formState: { errors, isDirty },
	} = useForm<AppBarSchema>({
		resolver: zodResolver(appBarSchema),
		defaultValues: {
			schema: "default",
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
				name="schema"
				render={({ field }) => (
					<SelectField
						label="Estilo da barra de navegação"
						error={errors.schema?.message}
						placeholder="Selecione um estilo"
						options={[
							{ label: "Padrão", value: "default" },
							{ label: "Nativo", value: "native" },
						]}
						value={field.value}
						onValueChange={field.onChange}
					/>
				)}
			/>
		</ProfileLayout>
	);
}
