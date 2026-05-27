"use client";

import type * as React from "react";

import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";

import { cn } from "@/lib/utils";

import { useIsMobile } from "@/hooks/use-mobile";

interface DetailsSidebarProps {
	children: React.ReactNode;
	header: React.ReactNode;
	open: boolean;
	onClose: () => void;
}

export function DetailsSidebar({
	children,
	header,
	open,
	onClose,
}: DetailsSidebarProps) {
	const isMobile = useIsMobile();

	if (isMobile) {
		return (
			<Drawer
				open={open}
				onOpenChange={(nextOpen) => {
					if (!nextOpen) {
						onClose();
					}
				}}
			>
				<DrawerContent className="gap-0 p-0 sm:max-w-none">
					<DrawerHeader className="border-b border-border bg-card px-4 py-4">
						<DrawerTitle className="sr-only">Detalhes</DrawerTitle>
						<div className="flex min-w-0 flex-col gap-1">
							{header}
						</div>
					</DrawerHeader>
					<div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
						{children}
					</div>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<aside
			className={cn(
				"hidden min-h-0 shrink-0 overflow-hidden border-l border-border bg-card transition-[width] duration-300 ease-in-out md:flex",
				open ? "w-[24rem]" : "w-0 border-l-0",
			)}
		>
			<div
				className={cn(
					"flex h-full w-[24rem] min-h-0 flex-col transition-opacity duration-200",
					open ? "opacity-100" : "pointer-events-none opacity-0",
				)}
			>
				<div className="flex items-center justify-between gap-4 border-b border-border px-6 py-6">
					<div className="flex min-w-0 flex-col gap-1">{header}</div>
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={onClose}
						aria-label="Fechar detalhes"
					>
						<XIcon className="size-4" />
					</Button>
				</div>
				<div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
					{children}
				</div>
			</div>
		</aside>
	);
}
