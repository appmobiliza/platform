import type { Metadata } from "next";

import { withServerTRPC } from "@/lib/trpc-server";

import { LocationsTable } from "./locations-table";

export const metadata: Metadata = {
	title: "Locais do campus",
};

export default async function SettingsPage() {
	const campusLocations = await withServerTRPC((trpc) =>
		trpc.locations.listAll(),
	);

	return (
		<section className="min-w-0 flex-1 bg-background">
			<div className="mx-auto flex w-full flex-col px-4 py-4 md:px-6 md:py-6">
				<div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
					<LocationsTable campusLocations={campusLocations} />
				</div>
			</div>
		</section>
	);
}
