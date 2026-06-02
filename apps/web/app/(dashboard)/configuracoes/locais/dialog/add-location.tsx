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

interface Props {
	children: React.ReactNode;
	className?: string;
}

export function AddLocationDialog({ children, className }: Props) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const createLocation = trpc.locations.create.useMutation({
		onSuccess() {
			router.refresh();
			setOpen(false);
		},
	});

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const description = String(formData.get("description") ?? "").trim();

		createLocation.mutate({
			name: String(formData.get("name") ?? "").trim(),
			abbreviation: String(formData.get("abbreviation") ?? "").trim(),
			description: description || undefined,
			latitude: Number(formData.get("latitude")),
			longitude: Number(formData.get("longitude")),
		});
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className={cn("sm:max-w-lg", className)}>
				<form onSubmit={handleSubmit} className="contents">
					<DialogHeader>
						<DialogTitle>Adicionar local</DialogTitle>
						<DialogDescription>
							Cadastre um ponto de referência usado nas
							solicitações de deslocamento.
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
									placeholder="RU"
								/>
							</Field>
						</div>
						<Field>
							<Label htmlFor="description">Descrição</Label>
							<Textarea
								id="description"
								name="description"
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
									placeholder="-35.775"
								/>
							</Field>
						</div>
						{createLocation.error ? (
							<Alert variant="destructive">
								<AlertDescription>
									{createLocation.error.message}
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
							disabled={createLocation.isPending}
						>
							{createLocation.isPending
								? "Salvando..."
								: "Salvar local"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
