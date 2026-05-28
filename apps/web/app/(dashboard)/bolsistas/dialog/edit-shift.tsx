"use client";

import type * as React from "react";

import {
	campusValues,
	courseValues,
	scholarShiftLabels,
	scholarShiftValues,
} from "@mobiliza/db/schema";
import { InfoIcon } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	ComboboxTrigger,
	ComboboxValue,
} from "@/components/ui/combobox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";

interface Props {
	children: React.ReactNode;
	className?: string;
}

export function EditShiftDialog({ children, className }: Props) {
	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<form>
				<DialogContent className={cn("sm:max-w-lg", className)}>
					<DialogHeader>
						<DialogTitle>Editar turno</DialogTitle>
						<DialogDescription>
							Edite informações sobre o turno de [NAME] aqui
						</DialogDescription>
					</DialogHeader>
					<Field>
						<Label htmlFor="shift">Turno</Label>
						<Select>
							<SelectTrigger>
								<SelectValue placeholder="Turno" />
							</SelectTrigger>
							<SelectContent id="shift">
								<SelectGroup>
									{scholarShiftValues.map((shift) => (
										<SelectItem key={shift} value={shift}>
											{scholarShiftLabels[shift]}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</Field>
					<Alert>
						<InfoIcon />
						Essa mudança ficará salva até que seja alterada
					</Alert>
					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="outline">
								Cancelar
							</Button>
						</DialogClose>
						<Button type="submit">Editar turno</Button>
					</DialogFooter>
				</DialogContent>
			</form>
		</Dialog>
	);
}
