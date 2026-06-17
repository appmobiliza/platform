import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";

import ProfileLayout from "@/layout/profile-layout";

import { Field } from "@/components/ui/field";
import { MaskedInput } from "@/components/ui/masked-input";
import { toast } from "@/components/ui/toast";

import { useUserRole } from "@/lib/auth/store";
import { trpc } from "@/lib/trpc/client";

import { type ProfilePhoneInput, ProfilePhoneSchema } from "@/schemas";

export default function BasicProfilePhone() {
	const router = useRouter();
	const role = useUserRole();
	const isScholar = role === "scholar";

	const { phone } = useLocalSearchParams<{ phone?: string }>();

	const updateStudent = trpc.profiles.updateStudent.useMutation();
	const updateScholar = trpc.profiles.updateScholar.useMutation();
	const utils = trpc.useUtils();

	const isSaving = updateStudent.isPending || updateScholar.isPending;

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
	} = useForm<ProfilePhoneInput>({
		resolver: zodResolver(ProfilePhoneSchema),
		defaultValues: {
			phone: phone ?? "",
		},
		mode: "onTouched",
	});

	const handleSave = handleSubmit(async (data) => {
		try {
			if (isScholar) {
				await updateScholar.mutateAsync({ phone: data.phone });
			} else {
				await updateStudent.mutateAsync({ phone: data.phone });
			}
			await utils.profiles.me.invalidate();
			reset(data);
			router.back();
		} catch (error) {
			console.error("Erro ao salvar telefone:", error);
			toast.error(
				"Não foi possível salvar as alterações. Tente novamente.",
			);
		}
	});

	return (
		<ProfileLayout
			title="Número de telefone"
			description="Este é seu número de telefone principal, usado para contato e recuperação de conta."
			handleSave={handleSave}
			isSaving={isSaving}
			isDirty={isDirty}
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
