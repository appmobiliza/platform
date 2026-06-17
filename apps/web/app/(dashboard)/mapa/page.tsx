import { MapPin } from "lucide-react";
import type { Metadata } from "next";

import { CampusMap } from "@/components/map/campus-map";

import { getCachedLocations } from "@/lib/cached-data";

export const metadata: Metadata = {
	title: "Ao vivo",
};

export default async function MapaPage() {
	const locations = await getCachedLocations();

	return (
		<section className="flex min-w-0 flex-1 flex-col bg-background">
			<header className="flex flex-col items-start gap-0 border-b border-border bg-card p-4 md:p-6">
				<div className="flex items-center gap-2">
					<MapPin className="size-4 text-foreground" />
					<h1 className="font-heading text-lg font-medium">
						Ao vivo
					</h1>
				</div>
				<p className="text-sm text-muted-foreground">
					Acompanhe os pontos de referência cadastrados em tempo real
				</p>
			</header>

			<div className="flex flex-1">
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
