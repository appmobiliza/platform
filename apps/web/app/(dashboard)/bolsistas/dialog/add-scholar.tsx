"use client";

import {
	campusValues,
	courseValues,
	genderLabels,
	genderValues,
	scholarShiftLabels,
	scholarShiftValues,
} from "@mobiliza/contracts";

import { useRouter } from "next/navigation";
import * as React from "react";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
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

import { trpc } from "@/providers/trpc-provider";

interface Props {
	children: React.ReactNode;
}

export function MutateScholarDialog({ children }: Props) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [course, setCourse] = useState<string>("");
	const [campus, setCampus] = useState<string>("");
	const [shift, setShift] = useState<string>("");
	const [gender, setGender] = useState<string>("");

	const createScholar = trpc.profiles.createScholarAsManager.useMutation({
		onSuccess() {
			router.refresh();
			setOpen(false);
		},
	});

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const name = String(formData.get("name") ?? "").trim();
		const email = String(formData.get("email") ?? "").trim();
		const registration = String(formData.get("registration") ?? "").trim();
		const phone = String(formData.get("phone") ?? "").trim();
		const cpf = String(formData.get("cpf") ?? "").trim();

		if (!course || !campus || !shift || !gender) {
			return;
		}

		createScholar.mutate({
			name,
			email,
			enrollment: registration,
			course,
			campus: campus as (typeof campusValues)[number],
			shift: shift as (typeof scholarShiftValues)[number],
			gender: gender as (typeof genderValues)[number],
			phone,
			cpf,
		});
	}

	const comboboxPortalRef = React.useRef<HTMLDivElement | null>(null);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-lg">
				<form onSubmit={handleSubmit} className="contents">
					<DialogHeader>
						<DialogTitle>Adicionar bolsista</DialogTitle>
						<DialogDescription>
							Adicione informações sobre o novo bolsista aqui
						</DialogDescription>
					</DialogHeader>
					<div ref={comboboxPortalRef}>
						<FieldGroup>
							<Field>
								<Label htmlFor="name">Nome completo</Label>
								<Input
									id="name"
									name="name"
									required
									minLength={2}
									placeholder="Nome do bolsista"
								/>
							</Field>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<Field>
									<Label htmlFor="course">Curso</Label>
									<Combobox
										items={courseValues}
										value={course}
										onValueChange={(v) =>
											setCourse(v ?? "")
										}
									>
										<ComboboxTrigger
											render={
												<Button
													type="button"
													variant="outline"
													className="w-full justify-between font-normal"
												>
													<ComboboxValue placeholder="Selecione um curso" />
												</Button>
											}
										/>
										<ComboboxContent
											container={comboboxPortalRef}
										>
											<ComboboxInput
												showTrigger={false}
												placeholder="Pesquisar curso"
											/>
											<ComboboxEmpty>
												Nenhum curso encontrado.
											</ComboboxEmpty>
											<ComboboxList>
												{(item) => (
													<ComboboxItem
														key={item}
														value={item}
													>
														{item}
													</ComboboxItem>
												)}
											</ComboboxList>
										</ComboboxContent>
									</Combobox>
								</Field>
								<Field>
									<Label htmlFor="campus">Campus</Label>
									<Combobox
										items={campusValues}
										value={campus}
										onValueChange={(v) =>
											setCampus(v ?? "")
										}
									>
										<ComboboxTrigger
											render={
												<Button
													type="button"
													variant="outline"
													className="w-full justify-between font-normal"
												>
													<ComboboxValue placeholder="Selecione um campus" />
												</Button>
											}
										/>
										<ComboboxContent
											container={comboboxPortalRef}
										>
											<ComboboxInput
												showTrigger={false}
												placeholder="Pesquisar campus"
											/>
											<ComboboxEmpty>
												Nenhum campus encontrado.
											</ComboboxEmpty>
											<ComboboxList>
												{(item) => (
													<ComboboxItem
														key={item}
														value={item}
													>
														{item}
													</ComboboxItem>
												)}
											</ComboboxList>
										</ComboboxContent>
									</Combobox>
								</Field>
								<Field>
									<Label htmlFor="registration">
										Matrícula
									</Label>
									<Input
										id="registration"
										name="registration"
										required
										placeholder="2023123456"
									/>
								</Field>
								<Field>
									<Label htmlFor="shift">Turno</Label>
									<Select
										value={shift}
										onValueChange={setShift}
										required
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Turno" />
										</SelectTrigger>
										<SelectContent id="shift">
											<SelectGroup>
												{scholarShiftValues.map(
													(_shift) => (
														<SelectItem
															key={_shift}
															value={_shift}
														>
															{
																scholarShiftLabels[
																	_shift
																]
															}
														</SelectItem>
													),
												)}
											</SelectGroup>
										</SelectContent>
									</Select>
								</Field>
								<Field>
									<Label htmlFor="gender">Gênero</Label>
									<Select
										value={gender}
										onValueChange={setGender}
										required
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Gênero" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												{genderValues.map((g) => (
													<SelectItem
														key={g}
														value={g}
													>
														{genderLabels[g]}
													</SelectItem>
												))}
											</SelectGroup>
										</SelectContent>
									</Select>
								</Field>
								<Field>
									<Label htmlFor="phone">Telefone</Label>
									<Input
										id="phone"
										name="phone"
										required
										placeholder="(99) 99999-9999"
									/>
								</Field>
							</div>
							<Field>
								<Label htmlFor="email">E-mail</Label>
								<Input
									id="email"
									name="email"
									type="email"
									required
									placeholder="bolsista@example.com"
								/>
							</Field>
							<Field>
								<Label htmlFor="cpf">CPF</Label>
								<Input
									id="cpf"
									name="cpf"
									required
									placeholder="999.999.999-99"
								/>
							</Field>
							{createScholar.error ? (
								<Alert variant="destructive">
									<AlertDescription>
										{createScholar.error.message}
									</AlertDescription>
								</Alert>
							) : null}
						</FieldGroup>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="outline">
								Cancelar
							</Button>
						</DialogClose>
						<Button
							type="submit"
							disabled={createScholar.isPending}
						>
							{createScholar.isPending
								? "Salvando..."
								: "Adicionar bolsista"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
