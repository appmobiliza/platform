"use client";

import * as React from "react";

import {
	campusValues,
	courseValues,
	scholarShiftLabels,
	scholarShiftValues,
} from "@mobiliza/db/schema";

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

interface Props {
	className?: string;
	children: React.ReactNode;
}

export function MutateScholarDialog({ className, children }: Props) {
	const comboboxPortalRef = React.useRef<HTMLDivElement | null>(null);

	return (
		<Dialog>
			<form className={className}>
				<DialogTrigger asChild>{children}</DialogTrigger>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Adicionar bolsista</DialogTitle>
						<DialogDescription>
							Adicione informações sobre o novo bolsista aqui
						</DialogDescription>
					</DialogHeader>
					<div ref={comboboxPortalRef}>
						<FieldGroup>
							<Field>
								<Label htmlFor="name-1">Nome completo</Label>
								<Input
									id="name-1"
									name="name"
									defaultValue="Pedro Duarte"
								/>
							</Field>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<Field>
									<Label htmlFor="course">Curso</Label>
									<Combobox
										items={courseValues}
										defaultValue={courseValues[0]}
									>
										<ComboboxTrigger
											render={
												<Button
													type="button"
													variant="outline"
													className="w-64 justify-between font-normal"
												>
													<ComboboxValue />
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
									<Combobox items={campusValues} id="campus">
										<ComboboxInput placeholder="Pesquisar campus" />
										<ComboboxContent
											container={comboboxPortalRef}
										>
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
										defaultValue="2023123456"
									/>
								</Field>
								<Field>
									<Label htmlFor="shift">Turno</Label>
									<Select>
										<SelectTrigger>
											<SelectValue placeholder="Turno" />
										</SelectTrigger>
										<SelectContent id="shift">
											<SelectGroup>
												{scholarShiftValues.map(
													(shift) => (
														<SelectItem
															key={shift}
															value={shift}
														>
															{
																scholarShiftLabels[
																	shift
																]
															}
														</SelectItem>
													),
												)}
											</SelectGroup>
										</SelectContent>
									</Select>
								</Field>
							</div>
							<Field>
								<Label htmlFor="email">E-mail</Label>
								<Input
									id="email"
									name="email"
									defaultValue="pedro.duarte@example.com"
								/>
							</Field>
							<Field>
								<Label htmlFor="phone">Telefone</Label>
								<Input
									id="phone"
									name="phone"
									placeholder="(99) 99999-9999"
								/>
							</Field>
							<Field>
								<Label htmlFor="cpf">CPF</Label>
								<Input
									id="cpf"
									name="cpf"
									placeholder="999.999.999-99"
								/>
							</Field>
						</FieldGroup>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="outline">
								Cancelar
							</Button>
						</DialogClose>
						<Button type="submit">Adicionar bolsista</Button>
					</DialogFooter>
				</DialogContent>
			</form>
		</Dialog>
	);
}
