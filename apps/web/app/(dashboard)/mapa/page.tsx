"use client";
import type { CampusLocation } from "@mobiliza/db/schema";

import { MapPin } from "lucide-react";

import { CampusMap } from "@/components/map/campus-map";

import { trpc } from "@/providers/trpc-provider";

// export const metadata: Metadata = {
// 	title: "Ao vivo",
// };

export default function MapaPage() {
	const { data: _locations = [] } = trpc.locations.list.useQuery();
	const locations = _locations as unknown as CampusLocation[];

	return (
		<section className="flex min-w-0 flex-1 flex-col bg-background">
			<header className="border-b border-border p-4 md:p-6 flex flex-col items-start gap-1 justify-between bg-card">
				<div className="flex items-center gap-2">
					<MapPin className="size-5 text-foreground" />
					<h1 className="font-heading text-lg font-medium">
						Mapa do campus
					</h1>
				</div>
				<p className="text-sm text-muted-foreground">
					Visualize os pontos de referência cadastrados no campus.
				</p>
			</header>

			{/* ── Map ────────────────────────────────────────────────────── */}
			<div className="flex flex-1 px-4 py-4 md:px-6 md:py-6">
				<div className="relative flex flex-1 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
					{locations.length === 0 ? (
						<div className="flex flex-1 items-center justify-center">
							<p className="text-sm text-muted-foreground">
								Nenhum local cadastrado.
							</p>
						</div>
					) : (
						<CampusMap locations={locations} className="flex-1" />
					)}
				</div>
			</div>

			{/* ── Legend ─────────────────────────────────────────────────── */}
			{locations.length > 0 && (
				<div className="border-t border-border/80 px-4 py-3 md:px-6">
					<p className="text-xs text-muted-foreground">
						{locations.length} ponto
						{locations.length !== 1 ? "s" : ""} de referência
						cadastrado{locations.length !== 1 ? "s" : ""}. Clique
						nos marcadores para ver detalhes.
					</p>
				</div>
			)}
		</section>
	);
}
