import { DatePickerWithRange } from "@/components/date-range-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { UserPicker } from "@/components/user-picker";

import { scholars, students } from "@/lib/mock";
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

export default function ServicesPage() {
	return (
		<section>
			<header className="border-b border-border p-4 flex flex-col items-start gap-1 justify-between bg-card">
				<h1 className="text-base font-semibold">Visão Geral</h1>
				<h2 className="text-sm text-muted-foreground">
					Sexta-feira, 24 de abril de 2026
				</h2>
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
			<div className="flex flex-col items-center justify-start">
				<div className="p-4 flex flex-col items-center justify-start gap-4 w-full">
					<DatePickerWithRange />
					<UserPicker
						users={scholars.map((scholar) => ({
							id: scholar.id,
							name: scholar.userId,
						}))}
					/>
					<UserPicker
						users={students.map((student) => ({
							id: student.id,
							name: student.userId,
						}))}
					/>
				</div>
				<Table></Table>
			</div>
		</section>
	);
}
