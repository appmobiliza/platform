"use client";

import { getCurrentShift } from "@mobiliza/db/schema";

import { DetailsSidebar } from "@/components/details/details-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getInitials } from "@/lib/utils";

import type { ScholarData } from "@/data/scholars-data";

import { closeScholarDetails, useScholarDetailsEntry } from "./store";

function getShiftLabel(shift: ScholarData["profile"]["shift"]) {
	switch (shift) {
		case "morning":
			return "Manhã";
		case "afternoon":
			return "Tarde";
		case "night":
			return "Noite";
		default:
			return shift;
	}
}

function getScholarStatus(scholar: ScholarData) {
	if (scholar.profile.shift !== getCurrentShift()) {
		return "off_shift";
	}

	if (scholar.profile.isAvailable) {
		return "available";
	}

	return "unavailable";
}

function getScholarStatusLabel(status: ReturnType<typeof getScholarStatus>) {
	switch (status) {
		case "available":
			return "Disponível";
		case "unavailable":
			return "Em atendimento";
		case "off_shift":
			return "Fora do turno";
	}
}

function getScholarStatusVariant(status: ReturnType<typeof getScholarStatus>) {
	switch (status) {
		case "available":
			return "success";
		case "unavailable":
			return "warning";
		case "off_shift":
			return "destructive";
	}
}

function ScholarDetailsContent({ scholar }: { scholar: ScholarData }) {
	const status = getScholarStatus(scholar);

	return (
		<div className="flex flex-col gap-4">
			<Card>
				<CardHeader className="space-y-2">
					<div className="flex items-center justify-between gap-4">
						<CardTitle>Resumo</CardTitle>
						<Badge variant={getScholarStatusVariant(status)}>
							{getScholarStatusLabel(status)}
						</Badge>
					</div>
					<p className="text-sm text-muted-foreground">
						{getShiftLabel(scholar.profile.shift)} •{" "}
						{scholar.profile.course}
					</p>
				</CardHeader>
				<CardContent className="grid gap-3 text-sm">
					<div className="flex items-center justify-between gap-3">
						<span className="text-muted-foreground">
							Atendimentos
						</span>
						<span className="font-medium">
							{scholar.summary.servicesAmounted}
						</span>
					</div>
					<div className="flex items-center justify-between gap-3">
						<span className="text-muted-foreground">
							Horas no mês
						</span>
						<span className="font-medium">
							{scholar.summary.monthHours}
						</span>
					</div>
					<div className="flex items-center justify-between gap-3">
						<span className="text-muted-foreground">
							Tempo médio
						</span>
						<span className="font-medium">
							{scholar.summary.averageDuration}
						</span>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Volume semanal</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 text-sm">
					{scholar.summary.servicesPerWeek.map((week) => (
						<div
							key={week.week}
							className="flex items-center justify-between gap-3"
						>
							<span className="text-muted-foreground">
								{week.week}
							</span>
							<span className="font-medium">{week.amount}</span>
						</div>
					))}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Rotas frequentes</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 text-sm">
					{scholar.summary.frequentRoutes.map((route) => (
						<div
							key={route.route}
							className="flex items-center justify-between gap-3"
						>
							<span className="text-muted-foreground">
								{route.route}
							</span>
							<span className="font-medium">{route.amount}</span>
						</div>
					))}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Alunos recorrentes</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 text-sm">
					{scholar.summary.frequentStudents.map((student) => (
						<div
							key={student.name}
							className="flex items-center justify-between gap-3"
						>
							<span className="text-muted-foreground">
								{student.name}
							</span>
							<span className="font-medium">
								{student.amount}
							</span>
						</div>
					))}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Perfil</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-3">
						<Avatar className="h-10 w-10">
							<AvatarFallback>
								{getInitials(scholar.user.name)}
							</AvatarFallback>
						</Avatar>
						<div className="min-w-0">
							<p className="font-medium">{scholar.user.name}</p>
							<p className="text-sm text-muted-foreground">
								{scholar.profile.course}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export function ScholarDetailsSidebar() {
	const selectedScholar = useScholarDetailsEntry();
	const scholar = selectedScholar.item;

	if (!scholar) {
		return null;
	}

	const status = getScholarStatus(scholar);

	return (
		<DetailsSidebar
			open={selectedScholar.isOpen}
			header={
				<div className="flex w-full items-center justify-between gap-2 md:flex-col md:items-start md:gap-1">
					<div className="flex min-w-0 flex-col gap-1">
						<h2 className="font-semibold">Detalhes do bolsista</h2>
						<p className="text-sm text-muted-foreground">
							{getShiftLabel(scholar.profile.shift)} •{" "}
							{scholar.profile.course}
						</p>
					</div>
					<Badge variant={getScholarStatusVariant(status)}>
						{getScholarStatusLabel(status)}
					</Badge>
				</div>
			}
			onClose={closeScholarDetails}
		>
			<ScholarDetailsContent scholar={scholar} />
		</DetailsSidebar>
	);
}
