"use client";

import {
	CloudSun,
	Info,
	MoonStar,
	SunMedium,
	TriangleAlert,
} from "lucide-react";

import {
	FloatingSaveChangesPanel,
	SectionCard,
	SectionTitle,
	SettingItem,
	SettingsSelect,
	ShiftCard,
	ShiftScheduleBlock,
} from "@/components/settings";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
	return (
		<>
			<section className="min-w-0 flex-1 bg-background">
				<div className="mx-auto flex w-full flex-col gap-6 px-4 pt-4 pb-20 md:p-6 opacity-50 pointer-events-none select-none">
					<div className="space-y-3">
						<SectionTitle>Operação</SectionTitle>
						<SectionCard>
							<SettingItem
								title="Tempo limite de solicitação"
								description='Solicitações sem aceite após este tempo passam para "não atendida"'
								content={
									<div className="w-full sm:w-44">
										<SettingsSelect
											value="5 minutos"
											items={[
												"5 minutos",
												"10 minutos",
												"15 minutos",
											]}
										/>
									</div>
								}
								className="border-b border-border/80"
							/>
							<SettingItem
								title="Aceite simultâneo por bolsista"
								description="Número máximo de solicitações que um bolsista pode aceitar ao mesmo tempo"
								content={
									<div className="w-full sm:w-24">
										<SettingsSelect
											value="1"
											items={["1", "2", "3"]}
										/>
									</div>
								}
							/>
						</SectionCard>
					</div>

					<div className="space-y-3">
						<SectionTitle>
							Turnos e dias de funcionamento
						</SectionTitle>
						<ShiftCard
							icon={CloudSun}
							iconClassName="bg-amber-500/10 text-amber-700"
							title="Matutino"
							description="07:00 – 12:00 · Seg a Sex"
							active
							defaultExpanded
						>
							<ShiftScheduleBlock
								start="07:00"
								end="12:00"
								days={["seg", "ter", "qua", "qui", "sex"]}
							/>
						</ShiftCard>

						<ShiftCard
							icon={SunMedium}
							iconClassName="bg-emerald-500/10 text-emerald-600"
							title="Vespertino"
							description="12:00 – 17:00 · Seg a Sex"
							active
						>
							<ShiftScheduleBlock
								start="12:00"
								end="18:00"
								days={["seg", "ter", "qua", "qui", "sex"]}
							/>
						</ShiftCard>

						<ShiftCard
							icon={MoonStar}
							iconClassName="bg-muted text-muted-foreground"
							title="Noturno"
							description="17:00 – 22:00"
							active
						>
							<ShiftScheduleBlock
								start="17:00"
								end="22:00"
								days={["seg", "ter", "qua", "qui", "sex"]}
							/>
						</ShiftCard>

						<Alert
							variant="info"
							className="border-info-border bg-info-muted text-info-foreground"
						>
							<Info className="size-4" />
							<div className="text-sm leading-5">
								Bolsistas cadastrados em turnos desativados só
								recebem solicitações quando o turno está ativo.
								Desativar um turno não desvincula os bolsistas;
								eles permanecem cadastrados e voltam a operar
								quando o turno for reativado.
							</div>
						</Alert>
					</div>

					<div className="space-y-3">
						<SectionTitle>Dados do campus</SectionTitle>
						<SectionCard>
							<SettingItem
								title="Nome da instituição"
								description="Exibido nos relatórios e no cabeçalho do painel"
								content={
									<Input
										readOnly
										value="UFAL — Campus A.C. Simões"
										className="h-9 bg-background px-3 md:min-w-xs text-foreground shadow-none"
									/>
								}
								className="border-b border-border/80"
							/>
							<SettingItem
								title="E-mail de contato"
								description="Usado como remetente de notificações institucionais"
								content={
									<Input
										readOnly
										value="nac@ufal.br"
										className="h-9 bg-background px-3 md:min-w-xs text-foreground shadow-none"
									/>
								}
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
								usuários. Altere com cuidado pois bolsistas e
								alunos existentes com outros domínios perderão
								acesso.
							</div>
						</Alert>
						<SectionCard>
							<SettingItem
								title="Restringir login por domínio de e-mail"
								description="Somente e-mails dos domínios abaixo poderão criar conta"
								content={<Switch defaultChecked size="lg" />}
								className="border-b border-border/80"
							/>
							<SettingItem
								title="Domínios permitidos"
								description="Separados por vírgula"
								content={
									<Input
										readOnly
										value="@ufal.br, @ic.ufal.br"
										className="h-9 bg-background px-3 md:min-w-xs text-foreground shadow-none"
									/>
								}
							/>
						</SectionCard>
					</div>

					<div className="space-y-3">
						<SectionTitle>Zona de perigo</SectionTitle>
						<SectionCard>
							<SettingItem
								title="Encerrar todas as sessões ativas"
								description="Desconecta bolsistas e alunos imediatamente — útil em incidentes"
								content={
									<Button
										variant="destructive"
										className="h-10 w-fit px-4"
									>
										Encerrar sessões
									</Button>
								}
								className="border-b border-border/80"
							/>
							<SettingItem
								title="Suspender recebimento de solicitações"
								description="Desativa o sistema temporariamente para manutenção ou recesso"
								content={
									<Button
										variant="secondary"
										className="h-9 px-4"
									>
										Suspender
									</Button>
								}
							/>
						</SectionCard>
					</div>
				</div>
			</section>
			<FloatingSaveChangesPanel />
		</>
	);
}
