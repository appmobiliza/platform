"use client";

import { useRouter } from "next/navigation";
import type * as React from "react";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";

import { trpc } from "@/providers/trpc-provider";

export interface CampusLocationData {
	id: string;
	name: string;
	abbreviation: string | null;
	description: string | null;
	latitude: number;
	longitude: number;
}

interface Props {
	location: CampusLocationData;
	children: React.ReactNode;
	className?: string;
}

export function EditLocationDialog({ location, children, className }: Props) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const updateLocation = trpc.locations.update.useMutation({
		onSuccess() {
			router.refresh();
			setOpen(false);
		},
	});

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const description = String(formData.get("description") ?? "").trim();

		updateLocation.mutate({
			id: location.id,
			data: {
				name: String(formData.get("name") ?? "").trim(),
				abbreviation: String(formData.get("abbreviation") ?? "").trim(),
				description: description || undefined,
				latitude: Number(formData.get("latitude")),
				longitude: Number(formData.get("longitude")),
			},
		});
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className={cn("sm:max-w-lg", className)}>
				<form onSubmit={handleSubmit} className="contents">
					<DialogHeader>
						<DialogTitle>Editar local</DialogTitle>
						<DialogDescription>
							Altere os dados do ponto de referência.
						</DialogDescription>
					</DialogHeader>
					<FieldGroup>
						<div className="flex flex-col gap-4 sm:flex-row">
							<Field>
								<Label htmlFor="name">Nome</Label>
								<Input
									id="name"
									name="name"
									required
									minLength={2}
									defaultValue={location.name}
									placeholder="Restaurante Universitário"
								/>
							</Field>
							<Field className="sm:max-w-28">
								<Label htmlFor="abbreviation">Sigla</Label>
								<Input
									id="abbreviation"
									name="abbreviation"
									required
									minLength={1}
									maxLength={20}
									defaultValue={location.abbreviation ?? ""}
									placeholder="RU"
								/>
							</Field>
						</div>
						<Field>
							<Label htmlFor="description">Descrição</Label>
							<Textarea
								id="description"
								name="description"
								defaultValue={location.description ?? ""}
								placeholder="Como chegar, pontos de referência, entradas acessíveis, etc."
							/>
						</Field>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<Field>
								<Label htmlFor="latitude">Latitude</Label>
								<Input
									id="latitude"
									name="latitude"
									type="number"
									step="any"
									required
									defaultValue={location.latitude}
									placeholder="-9.551"
								/>
							</Field>
							<Field>
								<Label htmlFor="longitude">Longitude</Label>
								<Input
									id="longitude"
									name="longitude"
									type="number"
									step="any"
									required
									defaultValue={location.longitude}
									placeholder="-35.775"
								/>
							</Field>
						</div>
						{updateLocation.error ? (
							<Alert variant="destructive">
								<AlertDescription>
									{updateLocation.error.message}
								</AlertDescription>
							</Alert>
						) : null}
					</FieldGroup>
					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="outline">
								Cancelar
							</Button>
						</DialogClose>
						<Button
							type="submit"
							disabled={updateLocation.isPending}
						>
							{updateLocation.isPending
								? "Salvando..."
								: "Salvar alterações"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
