"use client";

import type * as React from "react";

import { Card } from "@/components/ui/card";

type SectionCardProps = {
	children: React.ReactNode;
	className?: string;
};

function SectionCard({ children, className }: SectionCardProps) {
	return (
		<Card
			className={
				className ??
				"gap-0 overflow-hidden rounded-xl border border-border/80 bg-card py-0 shadow-none ring-0"
			}
		>
			{children}
		</Card>
	);
}

export { SectionCard };
