import { getSession } from "@mobiliza/auth/server";

import { headers } from "next/headers";
import { type ReactNode, Suspense } from "react";

import { LogoutButton } from "@/components/logout-button";
import { SectionCard, SectionTitle, SettingItem } from "@/components/settings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

function SectionShell({ children }: { children: ReactNode }) {
	return <div className="space-y-3">{children}</div>;
}

export default async function SettingsPage() {
	const h = await headers();
	const session = await getSession(h);

	const user = session?.user;

	return (
		<section className="min-w-0 flex-1 bg-background">
			<div className="mx-auto flex w-full flex-col gap-6 px-4 py-4 md:px-6 md:py-6">
				<Suspense fallback={<div></div>}>
					<SectionShell>
						<SectionTitle>PERFIL</SectionTitle>
						<SectionCard>
							<div className="flex flex-col gap-4 border-b border-border/70 p-4 md:flex-row md:items-center md:justify-between md:p-5">
								<div className="flex min-w-0 items-center gap-4">
									<Avatar className="size-16">
										<AvatarFallback>
											<span>
												{user?.name
													?.slice(0, 1)
													.toUpperCase()}
											</span>
										</AvatarFallback>
										<AvatarImage
											src={user?.image ?? undefined}
											alt={user?.name}
										/>
									</Avatar>
									<div className="min-w-0">
										<p className="truncate text-base font-semibold text-foreground">
											{user?.name}
										</p>
										<p className="truncate text-sm text-muted-foreground">
											{user?.email}
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
										{user?.email}
									</p>
								}
							/>
						</SectionCard>
					</SectionShell>
				</Suspense>

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
