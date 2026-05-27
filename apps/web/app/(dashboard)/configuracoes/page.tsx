"use client";

import * as React from "react";

import {
	ChevronDown,
	CloudSun,
	Info,
	MoonStar,
	SunMedium,
	TriangleAlert,
} from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { cn } from "@/lib/utils";

function SectionTitle({ children }: { children: string }) {
	return (
		<p className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
			{children}
		</p>
	);
}

function SectionCard({ children }: { children: React.ReactNode }) {
	return (
		<Card className="gap-0 overflow-hidden rounded-xl border border-border/80 bg-card py-0 shadow-none ring-0">
			{children}
		</Card>
	);
}

function StaticField({
	label,
	description,
	value,
}: {
	label: string;
	description: string;
	value: string;
}) {
	return (
		<div className="flex flex-col gap-4 border-b border-border/80 p-5 last:border-b-0">
			<div className="flex flex-col gap-1.5">
				<p className="text-sm font-medium text-foreground">{label}</p>
				<p className="text-sm leading-5 text-muted-foreground">
					{description}
				</p>
			</div>
			<Input
				readOnly
				value={value}
				className="h-9 bg-background px-3 text-foreground shadow-none"
			/>
		</div>
	);
}

function SettingsSelect({
	value,
	items,
	triggerClassName,
}: {
	value: string;
	items: string[];
	triggerClassName?: string;
}) {
	return (
		<Select defaultValue={value}>
			<SelectTrigger
				className={cn(
					"h-9 w-full bg-background shadow-none",
					triggerClassName,
				)}
			>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{items.map((item) => (
					<SelectItem key={item} value={item}>
						{item}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

function DayToggleGroup({ defaultValue }: { defaultValue: string[] }) {
	const days: Array<[string, string]> = [
		["seg", "Seg"],
		["ter", "Ter"],
		["qua", "Qua"],
		["qui", "Qui"],
		["sex", "Sex"],
		["sab", "Sáb"],
		["dom", "Dom"],
	];

	return (
		<ToggleGroup
			type="multiple"
			defaultValue={defaultValue}
			variant="outline"
			spacing={2}
			className="flex w-full flex-wrap justify-start gap-2.5"
		>
			{days.map(([value, label]) => (
				<ToggleGroupItem
					key={value}
					value={value}
					aria-label={label}
					className="h-9 min-w-9 rounded-full px-0 text-xs"
				>
					{label}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}

function ShiftCard({
	icon: Icon,
	iconClassName,
	title,
	description,
	active,
	defaultExpanded = active,
	children,
}: {
	icon: typeof CloudSun;
	iconClassName: string;
	title: string;
	description: string;
	active: boolean;
	defaultExpanded?: boolean;
	children?: React.ReactNode;
}) {
	const [isActive, setIsActive] = React.useState(active);
	const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

	React.useEffect(() => {
		setIsActive(active);
	}, [active]);

	React.useEffect(() => {
		setIsExpanded(defaultExpanded);
	}, [defaultExpanded]);

	const toggleExpanded = () => {
		if (!isActive) {
			return;
		}

		setIsExpanded((current) => !current);
	};

	return (
		<Card className="gap-0 overflow-hidden rounded-xl border border-border/80 bg-card py-0 shadow-none ring-0">
			<div className="flex items-center gap-4 border-b border-border/80 p-5">
				<button
					type="button"
					className={cn(
						"flex min-w-0 flex-1 items-center gap-4 text-left",
						isActive && "cursor-pointer",
					)}
					onClick={toggleExpanded}
					onKeyDown={(event) => {
						if (!isActive) {
							return;
						}

						if (event.key === "Enter" || event.key === " ") {
							event.preventDefault();
							toggleExpanded();
						}
					}}
				>
					<div
						className={cn(
							"flex size-12 shrink-0 items-center justify-center rounded-lg",
							iconClassName,
						)}
					>
						<Icon className="size-6" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="text-sm font-medium text-foreground">
							{title}
						</p>
						<p className="truncate text-sm text-muted-foreground">
							{description}
						</p>
					</div>
				</button>

				<div className="flex shrink-0 items-center gap-2">
					<Switch
						checked={isActive}
						onCheckedChange={(checked) => {
							setIsActive(Boolean(checked));
							setIsExpanded(Boolean(checked));
						}}
						size="default"
						className="h-6 w-11 bg-muted data-checked:bg-primary"
					/>
					<ChevronDown
						className={cn(
							"size-4 shrink-0 text-muted-foreground transition-transform",
							isExpanded && isActive && "rotate-180",
						)}
					/>
				</div>
			</div>

			{children && isActive && isExpanded ? (
				<div className="space-y-6 p-5 md:p-6">{children}</div>
			) : null}
		</Card>
	);
}

export default function SettingsPage() {
	return (
		<section className="min-w-0 flex-1 bg-background">
			<div className="mx-auto flex w-full max-w-190 flex-col gap-6 p-4 md:p-6">
				<div className="space-y-3">
					<SectionTitle>Operação</SectionTitle>
					<SectionCard>
						<div className="flex flex-col gap-4 border-b border-border/80 p-5">
							<div className="flex flex-col gap-1.5">
								<p className="text-sm font-medium text-foreground">
									Tempo limite de solicitação
								</p>
								<p className="text-sm leading-5 text-muted-foreground">
									Solicitações sem aceite após este tempo
									passam para "não atendida"
								</p>
							</div>
							<div className="w-full sm:w-44">
								<SettingsSelect
									value="20 minutos"
									items={[
										"10 minutos",
										"20 minutos",
										"30 minutos",
									]}
								/>
							</div>
						</div>
						<div className="flex flex-col gap-4 p-5">
							<div className="flex flex-col gap-1.5">
								<p className="text-sm font-medium text-foreground">
									Aceite simultâneo por bolsista
								</p>
								<p className="text-sm leading-5 text-muted-foreground">
									Número máximo de solicitações que um
									bolsista pode aceitar ao mesmo tempo
								</p>
							</div>
							<div className="w-full sm:w-24">
								<SettingsSelect
									value="1"
									items={["1", "2", "3"]}
								/>
							</div>
						</div>
					</SectionCard>
				</div>

				<div className="space-y-3">
					<SectionTitle>Turnos e dias de funcionamento</SectionTitle>
					<ShiftCard
						icon={CloudSun}
						iconClassName="bg-amber-500/10 text-amber-700"
						title="Matutino"
						description="07:00 – 12:00 · Seg a Sex"
						active
						defaultExpanded
					>
						<div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
							<div className="space-y-3">
								<p className="text-sm font-medium text-foreground">
									Intervalo de horário
								</p>
								<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
									<span className="text-sm text-foreground">
										Início
									</span>
									<div className="w-full sm:max-w-36">
										<Input
											readOnly
											value="07:00"
											className="h-10 bg-background px-3 text-base text-foreground shadow-none"
										/>
									</div>
									<span className="text-sm text-foreground">
										até
									</span>
									<div className="w-full sm:max-w-36">
										<Input
											readOnly
											value="12:00"
											className="h-10 bg-background px-3 text-base text-foreground shadow-none"
										/>
									</div>
								</div>
							</div>
							<div className="space-y-3">
								<p className="text-sm font-medium text-foreground">
									Dias ativos
								</p>
								<DayToggleGroup
									defaultValue={[
										"seg",
										"ter",
										"qua",
										"qui",
										"sex",
									]}
								/>
							</div>
						</div>
					</ShiftCard>

					<ShiftCard
						icon={SunMedium}
						iconClassName="bg-emerald-500/10 text-emerald-600"
						title="Vespertino"
						description="12:00 – 18:00 · Seg a Sex"
						active
						defaultExpanded
					>
						<div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
							<div className="space-y-3">
								<p className="text-sm font-medium text-foreground">
									Intervalo de horário
								</p>
								<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
									<span className="text-sm text-foreground">
										Início
									</span>
									<div className="w-full sm:max-w-36">
										<Input
											readOnly
											value="12:00"
											className="h-10 bg-background px-3 text-base text-foreground shadow-none"
										/>
									</div>
									<span className="text-sm text-foreground">
										até
									</span>
									<div className="w-full sm:max-w-36">
										<Input
											readOnly
											value="18:00"
											className="h-10 bg-background px-3 text-base text-foreground shadow-none"
										/>
									</div>
								</div>
							</div>
							<div className="space-y-3">
								<p className="text-sm font-medium text-foreground">
									Dias ativos
								</p>
								<DayToggleGroup
									defaultValue={[
										"seg",
										"ter",
										"qua",
										"qui",
										"sex",
									]}
								/>
							</div>
						</div>
					</ShiftCard>

					<ShiftCard
						icon={MoonStar}
						iconClassName="bg-muted text-muted-foreground"
						title="Noturno"
						description="Desativado"
						active={false}
					/>

					<Alert
						variant="info"
						className="border-info-border bg-info-muted text-info-foreground"
					>
						<Info className="size-4" />
						<div className="text-sm leading-5">
							Bolsistas cadastrados em turnos desativados só
							recebem solicitações quando o turno está ativo.
							Desativar um turno não desvincula os bolsistas; eles
							permanecem cadastrados e voltam a operar quando o
							turno for reativado.
						</div>
					</Alert>
				</div>

				<div className="space-y-3">
					<SectionTitle>Dados do campus</SectionTitle>
					<SectionCard>
						<StaticField
							label="Nome da instituição"
							description="Exibido nos relatórios e no cabeçalho do painel"
							value="UFAL — Campus A.C. Simões"
						/>
						<StaticField
							label="E-mail de contato"
							description="Usado como remetente de notificações institucionais"
							value="nac@ufal.br"
						/>
					</SectionCard>
				</div>

				<div className="space-y-3">
					<SectionTitle>Acesso e segurança</SectionTitle>
					<Alert
						variant="warning"
						className="border-warning-border bg-warning-muted text-warning-foreground"
					>
						<TriangleAlert className="size-4" />
						<div className="text-sm leading-5">
							Domínios restritos afetam o login de todos os
							usuários. Altere com cuidado pois bolsistas e alunos
							existentes com outros domínios perderão acesso.
						</div>
					</Alert>
					<SectionCard>
						<div className="flex flex-col gap-4 border-b border-border/80 p-5">
							<div className="flex flex-col gap-1.5">
								<p className="text-sm font-medium text-foreground">
									Restringir login por domínio de e-mail
								</p>
								<p className="text-sm leading-5 text-muted-foreground">
									Somente e-mails dos domínios abaixo poderão
									criar conta
								</p>
							</div>
							<Switch
								defaultChecked
								size="default"
								className="h-6 w-11 bg-muted data-checked:bg-primary"
							/>
						</div>
						<div className="flex flex-col gap-4 p-5">
							<div className="flex flex-col gap-1.5">
								<p className="text-sm font-medium text-foreground">
									Domínios permitidos
								</p>
								<p className="text-sm leading-5 text-muted-foreground">
									Separados por vírgula
								</p>
							</div>
							<Input
								readOnly
								value="@ufal.br, @ic.ufal.br"
								className="h-9 bg-background px-3 text-foreground shadow-none"
							/>
						</div>
					</SectionCard>
				</div>

				<div className="space-y-3">
					<SectionTitle>Zona de perigo</SectionTitle>
					<SectionCard>
						<div className="flex flex-col gap-4 p-5">
							<div className="flex flex-col gap-1.5">
								<p className="text-sm font-medium text-foreground">
									Encerrar todas as sessões ativas
								</p>
								<p className="text-sm leading-5 text-muted-foreground">
									Desconecta bolsistas e alunos imediatamente
									— útil em incidentes
								</p>
							</div>
							<Button
								variant="destructive"
								className="h-10 w-fit px-4"
							>
								Encerrar sessões
							</Button>
						</div>
						<div className="flex items-center justify-between gap-4 border-t border-border/80 p-5">
							<div className="flex flex-col gap-1.5">
								<p className="text-sm font-medium text-foreground">
									Suspender recebimento de solicitações
								</p>
								<p className="text-sm leading-5 text-muted-foreground">
									Desativa o sistema temporariamente para
									manutenção ou recesso
								</p>
							</div>
							<Button variant="secondary" className="h-9 px-4">
								Suspender
							</Button>
						</div>
					</SectionCard>
				</div>
			</div>
		</section>
	);
}
