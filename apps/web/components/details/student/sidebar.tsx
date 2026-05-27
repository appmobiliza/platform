"use client";

import { DetailsSidebar } from "@/components/details/details-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { getInitials } from "@/lib/utils";

import type { StudentData } from "@/data/students-data";

import { DetailsSection } from "../details-section";
import { closeStudentDetails, useStudentDetailsEntry } from "./store";

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
							<Badge variant={"secondary"}>
								{student.profile.disabilities
									.map((disability) => disability)
									.join(", ")}
							</Badge>
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
