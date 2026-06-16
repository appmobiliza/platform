"use client";

import type { CampusLocation } from "@mobiliza/db/schema";

import { MapPin, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { useMemo, useState } from "react";

import { CampusMap } from "@/components/map/campus-map";
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

type LocationData = Pick<
	CampusLocation,
	"id" | "name" | "abbreviation" | "description" | "latitude" | "longitude"
>;

interface Props {
	location?: LocationData;
	children: React.ReactNode;
	className?: string;
	/** Existing campus locations to show as reference markers on the map */
	campusLocations?: CampusLocation[];
}

export function MutateLocationDialog({
	location,
	children,
	className,
	campusLocations = [],
}: Props) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const isEditing = location !== undefined;

	// ── Controlled lat/lng state for map picker integration ──────────────

	const [latitude, setLatitude] = useState(
		location?.latitude?.toString() ?? "",
	);
	const [longitude, setLongitude] = useState(
		location?.longitude?.toString() ?? "",
	);
	const [showMapPicker, setShowMapPicker] = useState(false);

	// ── Reset state when dialog opens ───────────────────────────────────

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		if (newOpen) {
			setLatitude(location?.latitude?.toString() ?? "");
			setLongitude(location?.longitude?.toString() ?? "");
			setShowMapPicker(false);
		}
	};

	// ── TRPC mutations ───────────────────────────────────────────────────

	const createLocation = trpc.locations.create.useMutation({
		onSuccess() {
			router.refresh();
			setOpen(false);
		},
	});
	const updateLocation = trpc.locations.update.useMutation({
		onSuccess() {
			router.refresh();
			setOpen(false);
		},
	});

	const mutation = isEditing ? updateLocation : createLocation;

	// ── Parse lat/lng for the map selection (only when map is open) ────

	const parsedLat = useMemo(
		() => (latitude ? Number(latitude) : null),
		[latitude],
	);
	const parsedLng = useMemo(
		() => (longitude ? Number(longitude) : null),
		[longitude],
	);

	// ── Form submit ──────────────────────────────────────────────────────

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const description = String(formData.get("description") ?? "").trim();

		const data = {
			name: String(formData.get("name") ?? "").trim(),
			abbreviation: String(formData.get("abbreviation") ?? "").trim(),
			description: description || undefined,
			latitude: Number(formData.get("latitude")),
			longitude: Number(formData.get("longitude")),
		};

		if (isEditing) {
			updateLocation.mutate({ id: location.id, data });
		} else {
			createLocation.mutate(data);
		}
	}

	// ── Render ───────────────────────────────────────────────────────────

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent
				className={cn(
					"sm:max-w-lg",
					showMapPicker && "sm:max-w-xl",
					className,
				)}
			>
				<form onSubmit={handleSubmit} className="contents">
					<DialogHeader>
						<DialogTitle>
							{isEditing ? "Editar local" : "Adicionar local"}
						</DialogTitle>
						<DialogDescription>
							{isEditing
								? "Altere os dados do ponto de referência."
								: "Cadastre um ponto de referência usado nas solicitações de deslocamento."}
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
									defaultValue={location?.name ?? ""}
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
									defaultValue={location?.abbreviation ?? ""}
									placeholder="RU"
								/>
							</Field>
						</div>
						<Field>
							<Label htmlFor="description">Descrição</Label>
							<Textarea
								id="description"
								name="description"
								defaultValue={location?.description ?? ""}
								placeholder="Como chegar, pontos de referência, entradas acessíveis, etc."
							/>
						</Field>

						{/* ── Latitude / Longitude ───────────────────────────── */}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<Field>
								<Label htmlFor="latitude">Latitude</Label>
								<Input
									id="latitude"
									name="latitude"
									type="number"
									step="any"
									required
									value={latitude}
									onChange={(e) =>
										setLatitude(e.target.value)
									}
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
									value={longitude}
									onChange={(e) =>
										setLongitude(e.target.value)
									}
									placeholder="-35.775"
								/>
							</Field>
						</div>

						{/* ── Map picker ──────────────────────────────────────── */}
						<div className="flex flex-col gap-3">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setShowMapPicker(!showMapPicker)}
								className="w-full gap-2"
							>
								{showMapPicker ? (
									<X className="size-4" />
								) : (
									<MapPin className="size-4" />
								)}
								{showMapPicker
									? "Fechar mapa"
									: "Selecionar no mapa"}
							</Button>

							{showMapPicker && (
								<div className="h-65 overflow-hidden rounded-lg border">
									<CampusMap
										locations={campusLocations}
										selectionMode
										selectedLatitude={parsedLat}
										selectedLongitude={parsedLng}
										onSelectLocation={(lat, lng) => {
											setLatitude(lat.toFixed(6));
											setLongitude(lng.toFixed(6));
										}}
										showNavigation={false}
										className="h-full w-full"
									/>
								</div>
							)}
						</div>

						{/* ── Error alert ─────────────────────────────────────── */}
						{mutation.error ? (
							<Alert variant="destructive">
								<AlertDescription>
									{mutation.error.message}
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
						<Button type="submit" disabled={mutation.isPending}>
							{mutation.isPending
								? "Salvando..."
								: isEditing
									? "Salvar alterações"
									: "Salvar local"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
