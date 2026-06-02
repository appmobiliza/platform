import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";

import ProfileLayout from "@/layout/profile";

import { Field } from "@/components/ui/field";
import { MaskedInput } from "@/components/ui/masked-input";

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
		<ProfileLayout
			title="Número do CPF"
			description="Este é seu número de CPF, usado para identificação e registro."
			handleSave={handleSave}
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
		</ProfileLayout>
	);
}
