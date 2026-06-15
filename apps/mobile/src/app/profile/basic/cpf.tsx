import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";

import ProfileLayout from "@/layout/profile";

import { Field } from "@/components/ui/field";
import { MaskedInput } from "@/components/ui/masked-input";
import { toast } from "@/components/ui/toast";

import { useUserRole } from "@/lib/auth/store";
import { trpc } from "@/lib/trpc/client";

import { type ProfileCpfInput, ProfileCpfSchema } from "@/schemas";

export default function BasicProfileCpf() {
	const router = useRouter();
	const role = useUserRole();
	const isScholar = role === "scholar";

	const { cpf } = useLocalSearchParams<{ cpf?: string }>();

	const updateScholar = trpc.profiles.updateScholar.useMutation();
	const utils = trpc.useUtils();

	const isSaving = updateScholar.isPending;

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
	} = useForm<ProfileCpfInput>({
		resolver: zodResolver(ProfileCpfSchema),
		defaultValues: {
			cpf: cpf ?? "",
		},
		mode: "onTouched",
	});

	const handleSave = handleSubmit(async (data) => {
		if (!isScholar) {
			toast.warning("Apenas bolsistas podem alterar o CPF.");
			router.back();
			return;
		}

		try {
			await updateScholar.mutateAsync({ cpf: data.cpf });
			await utils.profiles.me.invalidate();
			reset(data);
			router.back();
		} catch (error) {
			console.error("Erro ao salvar CPF:", error);
			toast.error(
				"Não foi possível salvar as alterações. Tente novamente.",
			);
		}
	});

	return (
		<ProfileLayout
			title="Número do CPF"
			description="Este é seu número de CPF, usado para identificação e registro."
			handleSave={handleSave}
			isSaving={isSaving}
			isDirty={isDirty}
		>
			<Controller
				control={control}
				name="cpf"
				render={({ field }) => (
					<Field label="CPF" error={errors.cpf?.message}>
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
