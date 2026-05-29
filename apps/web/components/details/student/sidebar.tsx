"use client";

import { DetailsSidebar } from "@/components/details/details-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { getInitials } from "@/lib/utils";

import type { StudentData } from "@/data/students-data";

import { DetailsSection } from "../../section";
import { closeStudentDetails, useStudentDetailsEntry } from "./store";

function getRouteStatusVariant(status: "completed" | "pending" | "canceled") {
	switch (status) {
		case "completed":
			return "success";
		case "pending":
			return "outline";
		case "canceled":
			return "destructive";
	}
}

function getRouteStatusLabel(status: "completed" | "pending" | "canceled") {
	switch (status) {
		case "completed":
			return "Concluído";
		case "pending":
			return "Pendente";
		case "canceled":
			return "Cancelado";
	}
}

function StudentDetailsContent({ student }: { student: StudentData }) {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-3 flex-row w-full">
				<Card size="sm" className="flex-1 bg-muted">
					<CardHeader className="space-y-2">
						<CardTitle className="font-normal">
							Solicitações
						</CardTitle>
					</CardHeader>
					<CardContent className="text-2xl font-semibold">
						{student.summary.servicesAmount}
					</CardContent>
				</Card>

				<Card size="sm" className="flex-1 bg-muted">
					<CardHeader className="space-y-2">
						<CardTitle className="font-normal">Desde</CardTitle>
					</CardHeader>
					<CardContent className="text-2xl font-semibold">
						{new Date(student.user.createdAt)
							.toLocaleDateString("pt-BR", {
								month: "short",
								year: "numeric",
							})
							.replace(".", "")
							.replace(" de ", "/")}
					</CardContent>
				</Card>
			</div>

			<DetailsSection label="Observações">
				<p className="text-sm text-muted-foreground">
					{"Nenhuma observação registrada."}
				</p>
			</DetailsSection>

			<DetailsSection label="Rotas frequentes">
				{student.summary.frequentRoutes.map((route) => (
					<div
						key={route.route}
						className="flex items-center justify-between gap-3 text-sm"
					>
						<span>{route.route}</span>
						<span className="text-muted-foreground">
							{route.amount}x
						</span>
					</div>
				))}
			</DetailsSection>

			<DetailsSection label="Bolsistas que mais atenderam">
				{student.summary.frequentScholars.map((scholar) => (
					<div
						key={scholar.name}
						className="flex items-center justify-between gap-3"
					>
						<div className="flex flex-row items-center gap-3">
							<Avatar className="h-6 w-6">
								<AvatarFallback className="text-[8px]">
									{getInitials(scholar.name)}
								</AvatarFallback>
							</Avatar>
							<span className="text-sm">{scholar.name}</span>
						</div>
						<span className="text-sm text-muted-foreground">
							{scholar.amount}x
						</span>
					</div>
				))}
			</DetailsSection>

			<DetailsSection label="Últimos atendimentos">
				{student.summary.recentRoutes.map((route) => (
					<div
						key={route.route}
						className="flex items-center justify-between gap-3 text-sm px-3 py-1.5 rounded-md bg-muted"
					>
						<span>
							{new Date(route.date).toLocaleDateString("pt-BR")}{" "}
							→ {route.route}
						</span>
						<Badge variant={getRouteStatusVariant(route.status)}>
							{getRouteStatusLabel(route.status)}
						</Badge>
					</div>
				))}
			</DetailsSection>

			<Separator />

			<Button variant="outline">Ver histórico completo</Button>
		</div>
	);
}

export function StudentDetailsSidebar() {
	const selectedStudent = useStudentDetailsEntry();
	const student = selectedStudent.item;

	return (
		<DetailsSidebar
			open={selectedStudent.isOpen}
			header={
				student && (
					<div className="flex w-full justify-between gap-3 flex-col items-start">
						<div className="flex items-center gap-3 text-left">
							<Avatar className="h-10 w-10">
								<AvatarFallback>
									{getInitials(student.user.name)}
								</AvatarFallback>
							</Avatar>
							<div className="min-w-0">
								<p className="font-medium">
									{student.user.name}
								</p>
								<p className="text-sm text-muted-foreground">
									{student.profile.course}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2 flex-row">
							{student.profile.disabilities.map((disability) => (
								<Badge key={disability} variant={"secondary"}>
									Def. {disability}
								</Badge>
							))}
							<Badge variant={"success"}>Ativo</Badge>
						</div>
					</div>
				)
			}
			onClose={closeStudentDetails}
		>
			{student && <StudentDetailsContent student={student} />}
		</DetailsSidebar>
	);
}
