import type { Metadata } from "next";

import { scholarShiftLabels, scholarShiftValues } from "@mobiliza/db/schema";
import { Frown, Plus } from "lucide-react";

import { DetailsSidebar } from "@/components/details-sidebar";
import { ScholarCard } from "@/components/scholar-card";
import { dashboardCards, scholarsData } from "@/components/scholars-data";
import { StatusMessage } from "@/components/status-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComboboxMultiple } from "@/components/ui/combobox-multiple";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { cn } from "@/lib/utils";

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
						<Button size={"lg"} className="gap-2 px-3">
							<Plus className="size-4" />
							Adicionar bolsista
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

				<div className="flex min-w-0 flex-col gap-4 overflow-hidden p-4">
					<div className="flex flex-col md:flex-row items-start md:items-center justify-start gap-4">
						<Input
							placeholder="Buscar por nome, matrícula ou curso"
							className=""
						/>
						<ComboboxMultiple
							className="w-full md:max-w-sm"
							items={Object.entries(scholarShiftLabels).map(
								([value, label]) => ({ id: value, label }),
							)}
							allLabel="Todos os turnos"
						/>
						<div className="">
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
					</div>

					{scholarsData.length > 0 ? (
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
