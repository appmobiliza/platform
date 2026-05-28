import type { Metadata } from "next";

import {
	SettingsHeader,
	SettingsSubHeader,
} from "@/components/settings/settings-header";

export const metadata: Metadata = {
	title: "Configurações",
	description:
		"Gerencie as configurações da sua conta e preferências do sistema.",
	metadataBase: new URL("https://mobiliza.vercel.app/settings"),
};

export default function SettingsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<section className="flex min-w-0 flex-1 flex-col">
			<SettingsHeader />
			<SettingsSubHeader />
			{children}
		</section>
	);
}
