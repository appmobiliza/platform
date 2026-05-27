import type { Metadata } from "next";

import { ServicesPageClient } from "@/components/services-page-client";

export const metadata: Metadata = {
	title: "Atendimentos",
};

export default function ServicesPage() {
	return <ServicesPageClient />;
}
