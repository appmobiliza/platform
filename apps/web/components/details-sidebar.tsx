"use client";

import { XIcon } from "lucide-react";

import {
	closeServiceDetails,
	useServiceDetailsEntry,
} from "@/components/service-details-store";
import type { ServiceEntry } from "@/components/services-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";

import { cn, getInitials } from "@/lib/utils";

import { useIsMobile } from "@/hooks/use-mobile";

function getStatusBadgeVariant(status: ServiceEntry["status"]) {
	if (status === "concluded") {
		return "success";
	}

	if (status === "in_progress") {
		return "warning";
	}

	return "destructive";
}

function getStatusLabel(status: ServiceEntry["status"]) {
	if (status === "concluded") {
		return "Finalizado";
	}

	if (status === "in_progress") {
		return "Em atendimento";
	}

	return "Não atendido";
}

function ServiceDetailsContent({ entry }: { entry: ServiceEntry }) {
	return (
		<div className="flex flex-col gap-4">
			<Card>
				<CardHeader className="space-y-2">
					<div className="flex items-center justify-between gap-4">
						<CardTitle>Resumo</CardTitle>
						<Badge variant={getStatusBadgeVariant(entry.status)}>
							{getStatusLabel(entry.status)}
						</Badge>
					</div>
					<p className="text-sm text-muted-foreground">
						{entry.route} • {entry.date} às {entry.time}
					</p>
				</CardHeader>
				<CardContent className="space-y-3 text-sm">
					<div className="flex items-center justify-between gap-3">
						<span className="text-muted-foreground">Bolsista</span>
						<span className="font-medium">
							{entry.scholar.name}
						</span>
					</div>
					<div className="flex items-center justify-between gap-3">
						<span className="text-muted-foreground">Aluno</span>
						<span className="font-medium">
							{entry.student.name}
						</span>
					</div>
					<div className="flex items-center justify-between gap-3">
						<span className="text-muted-foreground">Duração</span>
						<span className="font-medium">{entry.duration}</span>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Observações</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm leading-6 text-muted-foreground">
						{entry.notes}
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Participantes</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex items-center gap-3">
						<Avatar className="h-10 w-10">
							<AvatarFallback>
								{getInitials(entry.scholar.name)}
							</AvatarFallback>
						</Avatar>
						<div className="min-w-0">
							<p className="font-medium">{entry.scholar.name}</p>
							<p className="text-sm text-muted-foreground">
								Bolsista
							</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<Avatar className="h-10 w-10">
							<AvatarFallback>
								{getInitials(entry.student.name)}
							</AvatarFallback>
						</Avatar>
						<div className="min-w-0">
							<p className="font-medium">{entry.student.name}</p>
							<p className="text-sm text-muted-foreground">
								Aluno
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export function DetailsSidebar() {
	const isMobile = useIsMobile();
	const selectedEntry = useServiceDetailsEntry();
	const entry = selectedEntry?.entry;

	if (!entry) {
		return null;
	}

	if (isMobile) {
		return (
			<Drawer
				open={selectedEntry.isOpen}
				onOpenChange={(nextOpen) => {
					if (!nextOpen) {
						closeServiceDetails();
					}
				}}
			>
				<DrawerContent className="gap-0 p-0 sm:max-w-none">
					<DrawerHeader className="border-b border-border bg-card px-4 py-4">
						<div className="flex items-start justify-center gap-4">
							<div className="flex min-w-0 flex-col gap-1">
								<DrawerTitle>
									Detalhes do atendimento
								</DrawerTitle>
								<DrawerDescription>
									{entry.date} às {entry.time}
								</DrawerDescription>
							</div>
							{/* <Button
								variant="ghost"
								size="icon-sm"
								onClick={closeServiceDetails}
								aria-label="Fechar detalhes"
							>
								<XIcon className="size-4" />
							</Button> */}
						</div>
					</DrawerHeader>
					<div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
						<ServiceDetailsContent entry={entry} />
					</div>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<aside
			className={cn(
				"hidden min-h-0 shrink-0 overflow-hidden border-l border-border bg-card transition-[width] duration-300 ease-in-out md:flex",
				selectedEntry.isOpen ? "w-[24rem]" : "w-0 border-l-0",
			)}
		>
			<div
				className={cn(
					"flex h-full w-[24rem] min-h-0 flex-col transition-opacity duration-200",
					selectedEntry.isOpen
						? "opacity-100"
						: "pointer-events-none opacity-0",
				)}
			>
				<div className="flex items-start justify-between gap-4 border-b border-border px-4 py-4">
					<div className="flex min-w-0 flex-col gap-1">
						<h2 className="font-semibold text-foreground">
							Detalhes do atendimento
						</h2>
						<p className="text-sm text-muted-foreground">
							{entry.date} às {entry.time}
						</p>
					</div>
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={closeServiceDetails}
						aria-label="Fechar detalhes"
					>
						<XIcon className="size-4" />
					</Button>
				</div>
				<div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
					<ServiceDetailsContent entry={entry} />
				</div>
			</div>
		</aside>
	);
}
