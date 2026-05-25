import { useState } from "react";

import { View } from "react-native";

import { SettingsHeader } from "@/components/settings-header";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetItem,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/select-sheet";
import { Text } from "@/components/ui/text";

const genderOptions = [
	"Masculino",
	"Feminino",
	"Não binário",
	"Prefiro não dizer",
] as const;

export default function BasicProfileGender() {
	const [selectedGender, setSelectedGender] = useState<
		(typeof genderOptions)[number] | null
	>(null);

	return (
		<View className="flex-1 gap-5 px-4 text-foreground pt-6">
			<SettingsHeader
				title="Gênero"
				description="Este é o gênero com o qual você se identifica."
			/>

			<Sheet>
				<SheetTrigger asChild>
					<Button>
						<Text>{selectedGender ?? "Selecionar gênero"}</Text>
					</Button>
				</SheetTrigger>
				<SheetContent>
					<SheetHeader>
						<SheetTitle>Selecione o gênero</SheetTitle>
						<SheetDescription>
							Escolha a opção que melhor representa você.
						</SheetDescription>
					</SheetHeader>

					<View className="gap-3">
						{genderOptions.map((gender) => (
							<SheetItem
								key={gender}
								label={gender}
								selected={selectedGender === gender}
								onPress={() => setSelectedGender(gender)}
							/>
						))}
					</View>

					<SheetFooter>
						<Button onPress={() => {}}>
							<Text>Selecionar</Text>
						</Button>
						<Button onPress={() => {}} variant={"outline"}>
							<Text>Cancelar</Text>
						</Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</View>
	);
}
