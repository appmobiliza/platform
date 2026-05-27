import type { Metadata } from "next";

import { Frown } from "lucide-react";

import { DatePickerWithRange } from "@/components/date-range-picker";
import { DetailsSidebar } from "@/components/details-sidebar";
import { ScholarCard } from "@/components/scholar-card";
import { dashboardCards, scholarsData } from "@/components/scholars-data";
import { ServiceDetailsTrigger } from "@/components/service-details-trigger";
import { StatusMessage } from "@/components/status-message";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { UserPicker } from "@/components/user-picker";

import { users } from "@/lib/mock";
import { cn, getInitials } from "@/lib/utils";

export const metadata: Metadata = {
	title: "Bolsistas",
};

export default function ScholarsPage() {
	const currentDate = new Date();

	return (
		<>
			<section className="min-w-0 flex-1">
				<header className="flex flex-row items-center justify-between border-b border-border bg-card p-4">
					<div className="flex flex-col gap-1">
						<h1 className="text-base font-semibold">
							Atendimentos
						</h1>
						<h2 className="text-sm text-muted-foreground">
							{currentDate.toLocaleDateString("pt-BR", {
								month: "long",
								year: "numeric",
							})}
						</h2>
					</div>
					<div className="flex flex-wrap items-center gap-4">
						<Badge
							variant="success"
							className="hidden py-3 md:flex"
						>
							<span className="mr-1 h-2 w-2 rounded-full bg-success" />
							Sistema ativo
						</Badge>
						<Button variant="outline" className="gap-2">
							Exportar CSV
						</Button>
					</div>
				</header>

				<div className="grid grid-cols-1 gap-4 border-b border-border p-4 md:grid-cols-3 md:p-6">
					{dashboardCards.map(({ title, value, variant }) => (
						<Card
							key={title}
							className="group w-full gap-2"
							data-size="sm"
						>
							<CardHeader>
								<CardTitle>{title}</CardTitle>
							</CardHeader>
							<CardContent>
								<p
									className={cn(
										"text-4xl font-bold",
										variant === "green"
											? "text-success"
											: variant === "yellow"
												? "text-yellow-500"
												: "text-foreground",
									)}
								>
									{value}
								</p>
							</CardContent>
						</Card>
					))}
				</div>

				<div className="flex min-w-0 flex-col gap-4 overflow-hidden py-4">
					<div className="flex min-w-0 w-full flex-col items-center justify-start gap-4 px-4 md:flex-row">
						<DatePickerWithRange className="w-full md:w-fit md:flex-1" />
						<UserPicker
							className="w-full flex-1 md:w-fit md:flex-1"
							users={users
								.filter((user) => user.role === "scholar")
								.map((scholar) => ({
									id: scholar.id,
									name: scholar.name,
								}))}
							allLabel="Todos os bolsistas"
						/>
						<UserPicker
							className="w-full flex-1 md:w-fit md:flex-1"
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
							<ToggleGroupItem
								value="all"
								aria-label="Exibir todos"
							>
								Todos
							</ToggleGroupItem>
							<ToggleGroupItem
								value="active"
								aria-label="Exibir ativos"
							>
								Ativos
							</ToggleGroupItem>
							<ToggleGroupItem
								value="inactive"
								aria-label="Exibir inativos"
							>
								Inativos
							</ToggleGroupItem>
						</ToggleGroup>
					</div>

					{scholarsData.length > 0 ? (
						<div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:grid-cols-3">
							{scholarsData.map((scholar) => (
								<ScholarCard
									key={scholar.user.id}
									scholar={scholar}
								/>
							))}
						</div>
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
			<DetailsSidebar />
		</>
	);
}
