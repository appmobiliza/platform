import {
	disabilityTypeLabels,
	disabilityTypeValues,
} from "@mobiliza/contracts";

import { Frown } from "lucide-react";
import type { Metadata } from "next";

import { ComboboxMultiple } from "@/components/combobox-multiple";
import {
	StudentDetailsSidebar,
	StudentDetailsTrigger,
} from "@/components/details";
import { StatusMessage } from "@/components/status-message";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { withServerTRPC } from "@/lib/trpc-server";
import { cn, getInitials } from "@/lib/utils";

import type { StudentData } from "@/data/students-data";

export const metadata: Metadata = {
	title: "Estudantes",
};

const sortOptions = [
	{ value: "recent", label: "Mais recentes" },
	{ value: "oldest", label: "Mais antigos" },
	{ value: "name-asc", label: "Nome (A-Z)" },
	{ value: "name-desc", label: "Nome (Z-A)" },
];

type StudentDashboardResponse = {
	cards: Array<{
		title: string;
		value: string;
	}>;
	students: StudentData[];
};

export default async function StudentsPage() {
	const dashboard = (await withServerTRPC((trpc) =>
		trpc.profiles.studentDashboard(),
	)) as StudentDashboardResponse;
	const studentsData = dashboard.students;

	return (
		<>
			<section className="min-w-0 flex-1">
				<header className="flex flex-row items-center justify-between border-b border-border bg-card p-4 md:p-6">
					<div className="flex flex-col gap-1">
						<h1 className="text-base font-semibold">Estudantes</h1>
						<h2 className="text-sm text-muted-foreground">
							Campus A.C. Simões · cadastros ativos
						</h2>
					</div>
					<div className="flex flex-wrap items-center gap-4">
						<Button variant="outline">Exportar lista</Button>
					</div>
				</header>

				<div className="grid grid-cols-1 gap-4 border-b border-border p-4 md:grid-cols-4 md:p-6">
					{dashboard.cards.map(({ title, value }) => (
						<Card key={title} className="group w-full gap-2">
							<CardHeader>
								<CardTitle>{title}</CardTitle>
							</CardHeader>
							<CardContent>
								<p
									className={cn(
										"text-4xl font-bold",
										title === "Com solicitação hoje" &&
											"text-info",
									)}
								>
									{value}
								</p>
							</CardContent>
						</Card>
					))}
				</div>

				<div className="flex min-w-0 flex-col gap-4 overflow-hidden py-4 md:py-6">
					<div className="flex min-w-0 w-full flex-col items-center justify-start gap-4 px-4 md:px-6 md:flex-row">
						<Input
							placeholder="Buscar por nome, matrícula ou curso"
							className=""
						/>
						<ComboboxMultiple
							items={disabilityTypeValues.map((disability) => ({
								id: disability,
								label: disabilityTypeLabels[disability],
							}))}
							allLabel="Todos os tipos de deficiência"
						/>
						<Select defaultValue="recent">
							<SelectTrigger className="w-full md:w-auto">
								<SelectValue placeholder="Ordenar por" />
							</SelectTrigger>
							<SelectContent>
								{sortOptions.map((option) => (
									<SelectItem
										key={option.value}
										value={option.value}
									>
										Ordenar por: {option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{studentsData.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="pl-6 md:pl-8">
										Aluno
									</TableHead>
									<TableHead>Deficiência</TableHead>
									<TableHead>Solicitações</TableHead>
									<TableHead>Último atendimento</TableHead>
									<TableHead className="pr-6 md:pr-8 text-right">
										Ações
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{studentsData.map((entry) => (
									<TableRow key={entry.user.id}>
										<TableCell className="pl-6 md:pl-8 font-medium">
											<div className="flex items-center gap-3">
												<Avatar className="h-8 w-8">
													<AvatarFallback>
														{getInitials(
															entry.user.name,
														)}
													</AvatarFallback>
												</Avatar>
												<span className="font-medium">
													{entry.user.name}
												</span>
											</div>
										</TableCell>
										<TableCell>
											{entry.profile.disabilities
												.map(
													(d) =>
														disabilityTypeLabels[
															d as keyof typeof disabilityTypeLabels
														],
												)
												.join(", ")}
										</TableCell>
										<TableCell>
											{entry.summary.servicesAmount}
										</TableCell>
										<TableCell>
											{entry.summary.recentRoutes[0]?.date
												? new Date(
														entry.summary
															.recentRoutes[0]
															.date,
													).toLocaleDateString(
														"pt-BR",
													)
												: "-"}
										</TableCell>
										<TableCell className="pr-6 md:pr-8 text-right">
											<StudentDetailsTrigger
												student={entry}
											/>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<StatusMessage
							className="my-48"
							title="Nenhum atendimento encontrado"
							description="Ajuste os filtros para encontrar atendimentos ou aguarde por novos registros."
							icon={<Frown className="size-8" />}
						/>
					)}
				</div>
			</section>
			<StudentDetailsSidebar />
		</>
	);
}
