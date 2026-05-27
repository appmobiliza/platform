"use client";

import type * as React from "react";

import { openScholarDetails } from "@/components/scholar-details-store";
import type { ScholarData } from "@/components/scholars-data";
import { Button } from "@/components/ui/button";

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
