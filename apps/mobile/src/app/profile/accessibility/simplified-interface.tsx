import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";

import ProfileLayout from "@/layout/profile";
import {
	type ProfileSimplifiedInterfaceInput,
	ProfileSimplifiedInterfaceSchema,
} from "@/schemas";

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AcademicProfileCourse() {
	const router = useRouter();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<ProfileSimplifiedInterfaceInput>({
		resolver: zodResolver(ProfileSimplifiedInterfaceSchema),
		defaultValues: {
			simplifiedInterface: undefined,
		},
		mode: "onTouched",
	});

	const handleSave = handleSubmit(() => {
		router.back();
	});

	return (
		<ProfileLayout
			title="Interface Simples"
			description="Ative ou desative a interface simplificada para acessibilidade"
		>
			<Controller
				control={control}
				name="simplifiedInterface"
				render={({ field }) => (
					<Field
						label="Observações"
						error={errors.simplifiedInterface?.message}
					>
						<Switch
							checked={field.value}
							onCheckedChange={field.onChange}
							disabled={field.disabled}
						/>
					</Field>
				)}
			/>

			<Button className="mt-8" onPress={handleSave}>
				<Text>Salvar alterações</Text>
			</Button>
		</ProfileLayout>
	);
}
