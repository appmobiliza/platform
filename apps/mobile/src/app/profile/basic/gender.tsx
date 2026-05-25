import { useCallback, useState } from "react";

import { ChevronDown } from "lucide-react-native";
import { View } from "react-native";

import { SettingsHeader } from "@/components/settings-header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetItem,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/select-sheet";
import { Text } from "@/components/ui/text";

// ─── Constants ───────────────────────────────────────────────────────────────

const GENDER_OPTIONS = [
	"Masculino",
	"Feminino",
	"Não binário",
	"Prefiro não dizer",
] as const;

type GenderOption = (typeof GENDER_OPTIONS)[number];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BasicProfileGender() {
	// Valor confirmado — persiste entre aberturas do sheet.
	const [selectedGender, setSelectedGender] = useState<GenderOption | null>(
		null,
	);

	// Rascunho local — sincronizado com o valor confirmado ao abrir o sheet
	// e descartado ao fechar sem salvar.
	const [draftGender, setDraftGender] = useState<GenderOption | null>(null);

	// Sincroniza o draft com o valor salvo ao abrir o sheet.
	const handleOpen = useCallback(() => {
		setDraftGender(selectedGender);
	}, [selectedGender]);

	// Descarta o draft ao fechar — cobre todos os gestos de fechamento:
	// botão "Fechar", arrastar para baixo e toque no backdrop.
	const handleDismiss = useCallback(() => {
		setDraftGender(selectedGender);
	}, [selectedGender]);

	// Promove o draft para valor confirmado.
	// O SheetClose chama dismiss() logo após, disparando handleDismiss —
	// mas como setSelectedGender é assíncrono (batch), o snapshot de
	// selectedGender em handleDismiss ainda seria o valor antigo.
	// Por isso resetamos o draft explicitamente aqui antes do dismiss.
	const handleSave = useCallback(() => {
		setSelectedGender(draftGender);
		setDraftGender(draftGender); // evita flash de reset no onDismiss
	}, [draftGender]);

	return (
		<View className="flex-1 gap-5 px-4 pt-6 text-foreground">
			<SettingsHeader
				title="Gênero"
				description="Este é o gênero com o qual você se identifica."
			/>

			<Field label="Gênero">
				<Sheet closeOnSelect={false}>
					<SheetTrigger asChild onPress={handleOpen}>
						<Button
							variant={"outline"}
							className="bg-transparent dark:bg-transparent w-full justify-between"
						>
							<Text>{selectedGender ?? "Selecionar gênero"}</Text>

							<Icon
								icon={ChevronDown}
								size={20}
								color="foreground"
							/>
						</Button>
					</SheetTrigger>

					<SheetContent onDismiss={handleDismiss} enableDynamicSizing>
						<SheetHeader>
							<SheetTitle>Gênero</SheetTitle>
							<SheetDescription>
								Selecione uma opção
							</SheetDescription>
						</SheetHeader>

						<View className="pt-3">
							{GENDER_OPTIONS.map((gender) => (
								<SheetItem
									key={gender}
									label={gender}
									selected={draftGender === gender}
									onPress={() => setDraftGender(gender)}
								/>
							))}
						</View>

						<SheetFooter>
							<SheetClose asChild>
								<Button onPress={handleSave}>
									<Text>Salvar</Text>
								</Button>
							</SheetClose>

							<SheetClose asChild>
								<Button
									variant="outline"
									className="bg-transparent dark:bg-transparent mb-2"
								>
									<Text>Cancelar</Text>
								</Button>
							</SheetClose>
						</SheetFooter>
					</SheetContent>
				</Sheet>
			</Field>
		</View>
	);
}
