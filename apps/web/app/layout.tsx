import { Geist_Mono, Inter } from "next/font/google";

import { TooltipProvider } from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

import { ThemeProvider } from "@/providers/theme-provider";
import { TRPCProvider } from "@/providers/trpc-provider";

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn(
				"antialiased",
				fontMono.variable,
				"font-sans",
				inter.variable,
			)}
		>
			<body>
				<TRPCProvider>
					<ThemeProvider>
						<TooltipProvider>{children}</TooltipProvider>
						<Toaster />
					</ThemeProvider>
				</TRPCProvider>
			</body>
		</html>
	);
}
