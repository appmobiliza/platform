import type { Metadata } from "next";

import { ExternalLink } from "lucide-react";

import { DatePickerWithRange } from "@/components/date-range-picker";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { UserPicker } from "@/components/user-picker";

import { users } from "@/lib/mock";
import { cn } from "@/lib/utils";

const dashboardCards: Array<{
	title: string;
	value: string;
	variant?: "default" | "destructive";
}> = [
	{
		title: "Total no mês",
		value: "94",
	},
	{
		title: "Tempo médio",
		value: "~14 min",
	},
	{
		title: "Não atendidos",
		value: "3",
		variant: "destructive",
	},
] as const;

const serviceEntries = [
	{
		id: "entry-1",
		date: "24/04",
		time: "09h00",
		scholar: {
			name: "João Carlos",
		},
		student: {
			name: "Maria Silva",
		},
	},
	{
		id: "entry-2",
		date: "24/04",
		time: "10h30",
		scholar: {
			name: "Ana Paula",
		},
		student: {
			name: "Lucas Almeida",
		},
	},
	{
		id: "entry-3",
		date: "24/04",
		time: "11h15",
		scholar: {
			name: "Bruno Costa",
		},
		student: {
			name: "Fernanda Lima",
		},
	},
] as const;

function getInitials(name: string) {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

export const metadata: Metadata = {
	title: "Atendimentos",
};

export default function ServicesPage() {
	const currentDate = new Date();

	return (
		<section className="min-w-0">
			<header className="border-b border-border p-4 flex flex-row items-center justify-between bg-card">
				<div className="flex flex-col gap-1">
					<h1 className="text-base font-semibold">Atendimentos</h1>
					<h2 className="text-sm text-muted-foreground">
						{currentDate.toLocaleDateString("pt-BR", {
							month: "long",
							year: "numeric",
						})}
					</h2>
				</div>
				<div className="flex items-center gap-4">
					<Badge variant={"success"} className="py-3">
						<span className="w-2 h-2 rounded-full bg-success mr-1" />
						Sistema ativo
					</Badge>
					<Button variant="outline" className="gap-2">
						Exportar CSV
					</Button>
				</div>
			</header>
			<div className="flex flex-col gap-4">
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full border-b border-border p-4 md:p-6">
					{dashboardCards.map(({ title, value, variant }) => (
						<Card
							key={title}
							className="group gap-2 w-full"
							data-size="sm"
						>
							<CardHeader>
								<CardTitle>{title}</CardTitle>
							</CardHeader>
							<CardContent>
								<p
									className={cn(
										"text-4xl font-bold",
										variant === "destructive" &&
											"text-destructive",
									)}
								>
									{value}
								</p>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
			<div className="flex min-w-0 flex-col my-4 items-start justify-center gap-4 overflow-hidden">
				<div className="flex min-w-0 w-full px-4 flex-col md:flex-row items-center justify-start gap-4">
					<DatePickerWithRange className="w-full md:w-fit md:flex-1" />
					<UserPicker
						className="flex-1 w-full md:w-fit md:flex-1"
						users={users
							.filter((user) => user.role === "scholar")
							.map((scholar) => ({
								id: scholar.id,
								name: scholar.name,
							}))}
						allLabel="Todos os bolsistas"
					/>
					<UserPicker
						className="flex-1 w-full md:w-fit md:flex-1"
						users={users
							.filter((user) => user.role === "student")
							.map((student) => ({
								id: student.id,
								name: student.name,
							}))}
						allLabel="Todos os alunos"
					/>
				</div>
				<div className="w-full min-w-0 overflow-x-auto pl-4 no-scrollbar">
					<ToggleGroup
						type="single"
						size="sm"
						className="w-full min-w-max"
						defaultValue="all"
						variant="default"
					>
						<ToggleGroupItem value="all" aria-label="Exibir todos">
							Todos
						</ToggleGroupItem>
						<ToggleGroupItem
							value="concluded"
							aria-label="Exibir concluídos"
						>
							Concluídos
						</ToggleGroupItem>
						<ToggleGroupItem
							value="In progress"
							aria-label="Exibir em andamento"
						>
							Em andamento
						</ToggleGroupItem>
						<ToggleGroupItem
							className="mr-4"
							value="Not attended"
							aria-label="Exibir não atendidos"
						>
							Não atendidos
						</ToggleGroupItem>
					</ToggleGroup>
				</div>
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="pl-6">Data</TableHead>
						<TableHead>Horário</TableHead>
						<TableHead>Bolsista</TableHead>
						<TableHead>Aluno</TableHead>
						<TableHead className="text-right pr-6">Ações</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{serviceEntries.map((entry) => (
						<TableRow key={entry.id}>
							<TableCell className="font-medium pl-6">
								{entry.date}
							</TableCell>
							<TableCell>{entry.time}</TableCell>
							<TableCell>
								<div className="flex items-center gap-3">
									<Avatar className="h-8 w-8">
										<AvatarFallback>
											{getInitials(entry.scholar.name)}
										</AvatarFallback>
									</Avatar>
									<span className="font-medium">
										{entry.scholar.name}
									</span>
								</div>
							</TableCell>
							<TableCell>
								<div className="flex items-center gap-3">
									<Avatar className="h-8 w-8">
										<AvatarFallback>
											{getInitials(entry.student.name)}
										</AvatarFallback>
									</Avatar>
									<span className="font-medium">
										{entry.student.name}
									</span>
								</div>
							</TableCell>
							<TableCell className="text-right pr-6">
								<Button
									variant="outline"
									size="sm"
									className="gap-2"
								>
									Ver
									<ExternalLink className="size-3" />
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</section>
	);
}
