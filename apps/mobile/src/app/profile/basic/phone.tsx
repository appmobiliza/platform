import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";

import ProfileLayout from "@/layout/profile";

import { Field } from "@/components/ui/field";
import { MaskedInput } from "@/components/ui/masked-input";

import { type ProfilePhoneInput, ProfilePhoneSchema } from "@/schemas";

export default function BasicProfilePhone() {
	const router = useRouter();

	const {
		control,
		handleSubmit,
		formState: { errors },
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
			title="Número de telefone"
			description="Este é seu número de telefone principal, usado para contato e recuperação de conta."
			handleSave={handleSave}
		>
			<Controller
				control={control}
				name="phone"
				render={({ field }) => (
					<Field
						label="Telefone"
						description="Use o número principal para contato e recuperação da conta."
						error={errors.phone?.message}
					>
						<MaskedInput
							mask="phone"
							placeholder="(00) 00000-0000"
							value={field.value}
							onBlur={field.onBlur}
							onChangeText={field.onChange}
							autoComplete="tel"
							accessibilityLabel="Telefone"
							aria-invalid={Boolean(errors.phone)}
						/>
					</Field>
				)}
			/>
		</ProfileLayout>
	);
}
