import type { Metadata } from "next";

import { Frown } from "lucide-react";

import { ComboboxMultiple } from "@/components/combobox-multiple";
import { DatePickerWithRange } from "@/components/date-range-picker";
import {
	StudentDetailsSidebar,
	StudentDetailsTrigger,
} from "@/components/details";
import { StatusMessage } from "@/components/status-message";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { cn, getInitials } from "@/lib/utils";

import { users } from "@/data/mock";
import { dashboardCards, studentsData } from "@/data/students-data";

export const metadata: Metadata = {
	title: "Estudantes",
};

export default function StudentsPage() {
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

				<div className="grid grid-cols-1 gap-4 border-b border-border p-4 md:grid-cols-3 md:p-6">
					{dashboardCards.map(({ title, value, variant }) => (
						<Card key={title} className="group w-full gap-2">
							<CardHeader>
								<CardTitle>{title}</CardTitle>
							</CardHeader>
							<CardContent>
								<p
									className={cn(
										"text-4xl font-bold",
										variant === "blue" && "text-info",
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
						<DatePickerWithRange className="w-full md:w-fit md:flex-1" />
						<ComboboxMultiple
							className="w-full flex-1 md:w-fit md:flex-1"
							items={users
								.filter((user) => user.role === "scholar")
								.map((scholar) => ({
									id: scholar.id,
									label: scholar.name,
								}))}
							allLabel="Todos os bolsistas"
						/>
						<ComboboxMultiple
							className="w-full flex-1 md:w-fit md:flex-1"
							items={users
								.filter((user) => user.role === "student")
								.map((student) => ({
									id: student.id,
									label: student.name,
								}))}
							allLabel="Todos os alunos"
						/>
					</div>
					<div className="w-full min-w-0 overflow-x-auto pl-4 md:pl-6 no-scrollbar">
						<ToggleGroup
							type="single"
							size="sm"
							className="w-full min-w-max"
							defaultValue="all"
							variant="default"
						>
							<ToggleGroupItem
								value="all"
								aria-label="Exibir todos"
							>
								Todos
							</ToggleGroupItem>
							<ToggleGroupItem
								value="concluded"
								aria-label="Exibir concluídos"
							>
								Concluídos
							</ToggleGroupItem>
							<ToggleGroupItem
								value="in_progress"
								aria-label="Exibir em andamento"
							>
								Em andamento
							</ToggleGroupItem>
							<ToggleGroupItem
								className="mr-4 md:mr-6"
								value="not_attended"
								aria-label="Exibir não atendidos"
							>
								Não atendidos
							</ToggleGroupItem>
						</ToggleGroup>
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
											{entry.profile.disabilities.join(
												", ",
											)}
										</TableCell>
										<TableCell>
											{entry.summary.servicesAmount}
										</TableCell>
										<TableCell>
											{entry.summary.recentRoutes[0]
												?.date || "-"}
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
