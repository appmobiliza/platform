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
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";

interface Props {
	children: React.ReactNode;
	className?: string;
}

export function AddLocationDialog({ children, className }: Props) {
	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<form>
				<DialogContent className={cn("sm:max-w-lg", className)}>
					<DialogHeader>
						<DialogTitle>Adicionar local</DialogTitle>
						<DialogDescription>
							Adicione informações sobre o local aqui
						</DialogDescription>
					</DialogHeader>
					<FieldGroup>
						<div className="flex flex-row gap-4 w-full">
							<Field>
								<Label htmlFor="name">Nome</Label>
								<Input
									id="name"
									placeholder="Restaurante Universitário"
								/>
							</Field>
							<Field className="flex-1 min-w-16">
								<Label htmlFor="abbreviation">Sigla</Label>
								<Input id="abbreviation" placeholder="RU" />
							</Field>
						</div>
						<Field>
							<Label htmlFor="description">Descrição</Label>
							<Textarea
								id="description"
								placeholder="Como chegar, pontos de referência, entradas acessíveis, etc."
							/>
						</Field>
					</FieldGroup>
					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="outline">
								Cancelar
							</Button>
						</DialogClose>
						<Button type="submit">Salvar local</Button>
					</DialogFooter>
				</DialogContent>
			</form>
		</Dialog>
	);
}
