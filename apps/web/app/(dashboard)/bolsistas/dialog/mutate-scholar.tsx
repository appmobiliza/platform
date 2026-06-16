"use client";

import {
	campusValues,
	courseValues,
	genderLabels,
	genderValues,
	type InsertScholarAsManagerInput,
	type UpdateScholarAsManagerInput,
} from "@mobiliza/contracts";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

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
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MaskedInput } from "@/components/ui/masked-input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { revalidateScholarDashboard } from "@/lib/actions";
import type { CachedScholar } from "@/lib/cached-data";

import { trpc } from "@/providers/trpc-provider";

// Local form schema – does NOT include `shift` (absent from scholar_profile table)
const FormSchema = z.object({
	userId: z.string().optional(),
	name: z.string().min(1, "Nome é obrigatório"),
	email: z.string().email("E-mail inválido"),
	enrollment: z.string().refine(
		(val) => {
			const digitsOnly = val.replace(/\D/g, "");
			return digitsOnly.length >= 5 && digitsOnly.length <= 20;
		},
		{ message: "Matrícula inválida" },
	),
	campus: z.enum(campusValues, { error: "Campus deve ser selecionado" }),
	course: z.enum(courseValues, { error: "Curso deve ser selecionado" }),
	phone: z
		.string()
		.regex(/^\(?\d{2}\)?[\s]?\d{4,5}[\s-]?\d{4}$/, "Telefone inválido"),
	gender: z.enum(genderValues, { error: "Gênero deve ser selecionado" }),
	cpf: z
		.string()
		.regex(/^(?:\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11})$/, "CPF inválido"),
});

type FormData = z.infer<typeof FormSchema>;

interface Props {
	children: React.ReactNode;
	scholar?: CachedScholar;
}

export function MutateScholarDialog({ children, scholar }: Props) {
	const router = useRouter();
	const [open, setOpen] = React.useState(false);
	const isEditing = Boolean(scholar);

	const form = useForm<FormData>({
		resolver: zodResolver(FormSchema),
		mode: "onSubmit",
	});

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
		register,
		reset,
	} = form;

	const createScholar = trpc.profiles.createScholarAsManager.useMutation({
		onSuccess() {
			revalidateScholarDashboard();
			router.refresh();
			setOpen(false);
			reset();
		},
	});

	const updateScholar = trpc.profiles.updateScholarAsManager.useMutation({
		onSuccess() {
			revalidateScholarDashboard();
			router.refresh();
			setOpen(false);
		},
	});

	const isPending = isEditing
		? updateScholar.isPending
		: createScholar.isPending;
	const mutationError = isEditing ? updateScholar.error : createScholar.error;

	function onSubmit(data: FormData) {
		if (isEditing) {
			const { name: _name, email: _email, userId, ...profileData } = data;
			updateScholar.mutate({
				userId: userId!,
				...profileData,
			} as UpdateScholarAsManagerInput);
		} else {
			const { userId: _userId, ...rest } = data;
			createScholar.mutate(rest as InsertScholarAsManagerInput);
		}
	}

	// Reset form with scholar data when editing
	useEffect(() => {
		if (open && scholar) {
			reset({
				userId: scholar.profile.userId,
				name: scholar.user.name,
				enrollment: scholar.profile.enrollment,
				course: scholar.profile.course as FormData["course"],
				campus: scholar.profile.campus as FormData["campus"],
				phone: scholar.profile.phone ?? "",
				email: scholar.user.email,
				cpf: scholar.profile.cpf ?? "",
				gender: scholar.profile.gender,
			});
		} else if (!open) {
			reset();
		}
	}, [open, scholar, reset]);

	const comboboxPortalRef = React.useRef<HTMLDivElement | null>(null);

	return (
		<Dialog
			open={open}
			onOpenChange={(v) => {
				setOpen(v);
				if (!v) {
					reset();
				}
			}}
		>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent
				className="sm:max-w-lg"
				preventClose={isSubmitting || isPending}
			>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="contents"
					noValidate
				>
					<DialogHeader>
						<DialogTitle>
							{isEditing
								? "Editar bolsista"
								: "Adicionar bolsista"}
						</DialogTitle>
						<DialogDescription>
							{isEditing
								? "Atualize as informações do bolsista"
								: "Adicione informações sobre o novo bolsista aqui"}
						</DialogDescription>
					</DialogHeader>
					<div ref={comboboxPortalRef}>
						<FieldGroup>
							{/* Nome completo – full width */}
							<Field data-invalid={!!errors.name}>
								<Label htmlFor="name">Nome completo</Label>
								<Input
									id="name"
									{...register("name")}
									placeholder="Nome do bolsista"
									aria-invalid={!!errors.name}
								/>
								{errors.name && (
									<FieldError errors={[errors.name]} />
								)}
							</Field>

							{/* Campus + Curso – side by side */}
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<Field data-invalid={!!errors.campus}>
									<Label htmlFor="campus">Campus</Label>
									<Controller
										name="campus"
										control={control}
										render={({ field }) => (
											<Combobox
												items={campusValues}
												value={field.value}
												onValueChange={(v) =>
													field.onChange(v ?? "")
												}
											>
												<ComboboxTrigger
													render={
														<Button
															type="button"
															variant="outline"
															className="w-full justify-between font-normal"
															aria-invalid={
																!!errors.campus
															}
														>
															<ComboboxValue placeholder="Selecione um campus" />
														</Button>
													}
												/>
												<ComboboxContent
													container={
														comboboxPortalRef
													}
												>
													<ComboboxInput
														showTrigger={false}
														placeholder="Pesquisar campus"
													/>
													<ComboboxEmpty>
														Nenhum campus
														encontrado.
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
										)}
									/>
									{errors.campus && (
										<FieldError errors={[errors.campus]} />
									)}
								</Field>
								<Field data-invalid={!!errors.course}>
									<Label htmlFor="course">Curso</Label>
									<Controller
										name="course"
										control={control}
										render={({ field }) => (
											<Combobox
												items={courseValues}
												value={field.value}
												onValueChange={(v) =>
													field.onChange(v ?? "")
												}
											>
												<ComboboxTrigger
													render={
														<Button
															type="button"
															variant="outline"
															className="w-full justify-between font-normal"
															aria-invalid={
																!!errors.course
															}
														>
															<ComboboxValue placeholder="Selecione um curso" />
														</Button>
													}
												/>
												<ComboboxContent
													container={
														comboboxPortalRef
													}
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
										)}
									/>
									{errors.course && (
										<FieldError errors={[errors.course]} />
									)}
								</Field>
							</div>

							{/* Matrícula + Gênero – side by side */}
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<Field data-invalid={!!errors.enrollment}>
									<Label htmlFor="enrollment">
										Matrícula
									</Label>
									<Controller
										name="enrollment"
										control={control}
										render={({ field }) => (
											<MaskedInput
												id="enrollment"
												mask="enrollment"
												placeholder="2023123456"
												value={field.value}
												onChange={field.onChange}
												aria-invalid={
													!!errors.enrollment
												}
											/>
										)}
									/>
									{errors.enrollment && (
										<FieldError
											errors={[errors.enrollment]}
										/>
									)}
								</Field>
								<Field data-invalid={!!errors.gender}>
									<Label htmlFor="gender">Gênero</Label>
									<Controller
										name="gender"
										control={control}
										render={({ field }) => (
											<Select
												value={field.value}
												onValueChange={field.onChange}
											>
												<SelectTrigger
													id="gender"
													className="w-full"
													aria-invalid={
														!!errors.gender
													}
												>
													<SelectValue placeholder="Gênero" />
												</SelectTrigger>
												<SelectContent>
													<SelectGroup>
														{genderValues.map(
															(g) => (
																<SelectItem
																	key={g}
																	value={g}
																>
																	{
																		genderLabels[
																			g
																		]
																	}
																</SelectItem>
															),
														)}
													</SelectGroup>
												</SelectContent>
											</Select>
										)}
									/>
									{errors.gender && (
										<FieldError errors={[errors.gender]} />
									)}
								</Field>
							</div>

							{/* E-mail – full width */}
							<Field data-invalid={!!errors.email}>
								<Label htmlFor="email">E-mail</Label>
								<Input
									id="email"
									type="email"
									{...register("email")}
									placeholder="bolsista@example.com"
									aria-invalid={!!errors.email}
								/>
								{errors.email && (
									<FieldError errors={[errors.email]} />
								)}
							</Field>

							{/* Telefone – full width */}
							<Field data-invalid={!!errors.phone}>
								<Label htmlFor="phone">Telefone</Label>
								<Controller
									name="phone"
									control={control}
									render={({ field }) => (
										<MaskedInput
											id="phone"
											mask="phone"
											placeholder="(99) 99999-9999"
											value={field.value}
											onChange={field.onChange}
											aria-invalid={!!errors.phone}
										/>
									)}
								/>
								{errors.phone && (
									<FieldError errors={[errors.phone]} />
								)}
							</Field>

							{/* CPF – full width */}
							<Field data-invalid={!!errors.cpf}>
								<Label htmlFor="cpf">CPF</Label>
								<Controller
									name="cpf"
									control={control}
									render={({ field }) => (
										<MaskedInput
											id="cpf"
											mask="cpf"
											placeholder="999.999.999-99"
											value={field.value}
											onChange={field.onChange}
											aria-invalid={!!errors.cpf}
										/>
									)}
								/>
								{errors.cpf && (
									<FieldError errors={[errors.cpf]} />
								)}
							</Field>

							{mutationError ? (
								<Alert variant="destructive">
									<AlertDescription>
										{mutationError.message}
									</AlertDescription>
								</Alert>
							) : null}
						</FieldGroup>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button
								type="button"
								variant="outline"
								disabled={isSubmitting || isPending}
							>
								Cancelar
							</Button>
						</DialogClose>
						<Button
							type="submit"
							disabled={isSubmitting || isPending}
						>
							{isPending
								? "Salvando..."
								: isEditing
									? "Salvar alterações"
									: "Adicionar bolsista"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
