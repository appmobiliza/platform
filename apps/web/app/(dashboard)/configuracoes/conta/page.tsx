import type { ReactNode } from "react";

import { LogoutButton } from "@/components/logout-button";
import { SectionCard, SectionTitle, SettingItem } from "@/components/settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const activeSessions = [
	{
		device: "Chrome · macOS",
		location: "Maceió, AL · agora",
		current: true,
	},
	{
		device: "Safari · iPhone",
		location: "Maceió, AL · há 2 dias",
		current: false,
	},
	{
		device: "Chrome · Windows",
		location: "Maceió, AL · há 5 dias",
		current: false,
	},
];

function SectionShell({ children }: { children: ReactNode }) {
	return <div className="space-y-3">{children}</div>;
}

function SessionRow({
	device,
	location,
	current,
}: {
	device: string;
	location: string;
	current?: boolean;
}) {
	return (
		<div className="flex gap-4 border-b border-border/70 p-5 last:border-b-0 flex-row flex-wrap items-center justify-between">
			<div className="flex min-w-0 items-start gap-3">
				<span className="mt-2 size-2 shrink-0 rounded-full bg-emerald-500" />
				<div className="min-w-0 space-y-0.5">
					<p className="text-sm font-medium text-foreground">
						{device}
					</p>
					<p className="text-sm text-muted-foreground">{location}</p>
				</div>
			</div>
			<div className="flex flex-col items-start gap-3 md:items-end">
				{current ? (
					<Badge
						variant="success"
						className="h-6 px-3 text-[12px] font-semibold"
					>
						Esta sessão
					</Badge>
				) : (
					<Button type="button" variant="outline" size="lg">
						Encerrar
					</Button>
				)}
			</div>
		</div>
	);
}

export default function SettingsPage() {
	return (
		<section className="min-w-0 flex-1 bg-background">
			<div className="mx-auto flex w-full flex-col gap-6 px-4 py-4 md:px-6 md:py-6">
				<SectionShell>
					<SectionTitle>PERFIL</SectionTitle>
					<SectionCard>
						<div className="flex flex-col gap-4 border-b border-border/70 p-4 md:flex-row md:items-center md:justify-between md:p-5">
							<div className="flex min-w-0 items-center gap-4">
								<div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#cde9eb] text-[20px] font-semibold text-primary">
									AG
								</div>
								<div className="min-w-0">
									<p className="truncate text-base font-semibold text-foreground">
										Adriana Gomes
									</p>
									<p className="truncate text-sm text-muted-foreground">
										adriana.gomes@ufal.br
									</p>
								</div>
							</div>
							<Badge
								variant="default"
								className="h-6 w-full justify-center rounded-full px-3 text-xs font-semibold md:w-fit"
							>
								Administração
							</Badge>
						</div>

						{/*<SettingItem
							title="Nome de exibição"
							description="Aparece no cabeçalho do painel e nos registros do sistema"
							className="border-b border-border/70"
							content={
								<Input
									readOnly
									value="Adriana Gomes"
									className="h-10 w-full bg-background px-3 text-foreground shadow-none md:w-80"
								/>
							}
						/>*/}

						<SettingItem
							title="E-mail"
							description="Vinculado à conta Mobiliza via e-mail institucional"
							content={
								<p className="w-full text-sm font-medium text-foreground md:w-auto md:text-right">
									adriana.gomes@ufal.br
								</p>
							}
						/>
					</SectionCard>
				</SectionShell>

				{/*<SectionShell>
					<SectionTitle>SESSÕES ATIVAS</SectionTitle>
					<SectionCard>
						{activeSessions.map((session) => (
							<SessionRow
								key={session.device}
								device={session.device}
								location={session.location}
								current={session.current}
							/>
						))}
						<div className="flex flex-col gap-4 px-5 py-5 md:py-3 bg-background md:flex-row md:items-center md:justify-between">
							<p className="text-sm text-muted-foreground">
								Sessões expiram automaticamente após 30 dias de
								inatividade
							</p>
							<Button
								type="button"
								variant="outline"
								size="lg"
								className="w-fit px-4 text-sm"
							>
								Encerrar todas
							</Button>
						</div>
					</SectionCard>
				</SectionShell>*/}

				<SectionShell>
					<SectionTitle>SESSÃO</SectionTitle>
					<SectionCard>
						<SettingItem
							title="Sair do painel"
							description="Encerra a sessão atual neste dispositivo"
							content={
								<LogoutButton
									variant="destructive"
									size="lg"
									className="h-10 w-fit px-4 text-sm"
								/>
							}
						/>
					</SectionCard>
				</SectionShell>
			</div>
		</section>
	);
}
