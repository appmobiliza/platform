"use client";

import type * as React from "react";

import { Button } from "@/components/ui/button";

import type { ScholarData } from "@/data/scholars-data";

import { openScholarDetails } from "./store";

export function ScholarDetailsTrigger({
	scholar,
	children,
	className,
}: {
	scholar: ScholarData;
	children?: React.ReactNode;
	className?: string;
}) {
	return (
		<Button
			className={className}
			onClick={() => openScholarDetails(scholar)}
		>
			{children ?? "Ver detalhe"}
		</Button>
	);
}
