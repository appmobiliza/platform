import type { Metadata } from "next";

import { Plus, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const metadata: Metadata = {
	title: "Locais do campus",
};

const locationFilters = [
	{
		value: "all",
		label: "Todos (11)",
	},
	{
		value: "active",
		label: "Ativos (9)",
	},
	{
		value: "inactive",
		label: "Inativos (2)",
	},
];

const campusLocations = [
	{
		name: "Instituto de Computação",
		sigla: "IC",
		type: "Fixo",
		active: true,
	},
	{
		name: "Restaurante Universitário",
		sigla: "RU",
		type: "Fixo",
		active: true,
	},
	{
		name: "Biblioteca Central",
		sigla: "—",
		type: "Fixo",
		active: true,
	},
	{
		name: "Reitoria",
		sigla: "—",
		type: "Fixo",
		active: true,
	},
	{
		name: "Faculdade de Medicina",
		sigla: "FAMED",
		type: "Fixo",
		active: true,
	},
	{
		name: "Entrada principal da UFAL",
		sigla: "—",
		type: "Ponto aberto",
		active: true,
	},
	{
		name: "Estacionamento central",
		sigla: "—",
		type: "Ponto aberto",
		active: true,
	},
	{
		name: "Faculdade de Artes",
		sigla: "FA",
		type: "Fixo",
		active: true,
	},
	{
		name: "Instituto de Tecnologia",
		sigla: "IT",
		type: "Fixo",
		active: true,
	},
	{
		name: "Portaria leste",
		sigla: "—",
		type: "Ponto aberto",
		active: true,
	},
	{
		name: "Centro de Ciências Exatas",
		sigla: "CCE",
		type: "Fixo",
		active: false,
	},
	{
		name: "Centro de Educação",
		sigla: "CEDU",
		type: "Fixo",
		active: false,
	},
];

export default function SettingsPage() {
	return (
		<section className="min-w-0 flex-1 bg-background">
			<div className="mx-auto flex w-full flex-col px-4 py-4 md:px-6 md:py-6">
				<div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
					<div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:p-5">
						<div className="flex min-w-0 flex-1 flex-col gap-4 md:flex-row md:items-center">
							<div className="relative w-full md:max-w-67">
								<Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									aria-label="Buscar local"
									placeholder="Buscar local..."
									className="pl-10 text-sm shadow-none placeholder:text-muted-foreground/80"
								/>
							</div>

							<ToggleGroup
								type="single"
								defaultValue="all"
								size="sm"
								className="w-full flex-wrap justify-start"
							>
								{locationFilters.map((filter) => (
									<ToggleGroupItem
										key={filter.value}
										value={filter.value}
										aria-label={filter.label}
									>
										{filter.label}
									</ToggleGroupItem>
								))}
							</ToggleGroup>
						</div>

						<Button
							type="button"
							size="lg"
							className="w-full px-3 gap-2 md:w-auto md:self-start"
						>
							<Plus className="size-4" />
							Novo local
						</Button>
					</div>

					<div className="border-t border-border/70">
						<Table>
							<TableHeader>
								<TableRow className="hover:bg-transparent">
									<TableHead className="h-11 px-4 text-sm font-medium text-foreground/80">
										Nome
									</TableHead>
									<TableHead className="h-11 px-4 text-right text-sm font-medium text-foreground/80">
										Sigla
									</TableHead>
									<TableHead className="hidden h-11 px-4 text-center text-sm font-medium text-foreground/80 md:table-cell">
										Tipo
									</TableHead>
									<TableHead className="hidden h-11 px-4 text-center text-sm font-medium text-foreground/80 md:table-cell">
										Ativo
									</TableHead>
									<TableHead className="hidden h-11 px-4 text-right text-sm font-medium text-foreground/80 md:table-cell">
										Ações
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{campusLocations.map((location) => (
									<TableRow
										key={location.name}
										className="h-14"
									>
										<TableCell className="px-4 py-4 text-sm text-foreground">
											{location.name}
										</TableCell>
										<TableCell className="px-4 py-4 text-right text-sm text-foreground/90">
											{location.sigla}
										</TableCell>
										<TableCell className="hidden px-4 py-4 text-center md:table-cell">
											<Badge
												variant={
													location.type === "Fixo"
														? "default"
														: "secondary"
												}
												className="h-5"
											>
												{location.type}
											</Badge>
										</TableCell>
										<TableCell className="hidden px-4 py-4 md:table-cell">
											<div className="flex justify-center">
												<Switch
													size="lg"
													defaultChecked={
														location.active
													}
													aria-label={`Ativar local ${location.name}`}
												/>
											</div>
										</TableCell>
										<TableCell className="hidden px-4 py-4 text-right md:table-cell">
											<Button
												type="button"
												variant="outline"
												size="lg"
												className="h-10 rounded-md px-4"
											>
												Editar
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</div>
			</div>
		</section>
	);
}
