"use client";

import { ExternalLink } from "lucide-react";
import type * as React from "react";

import { Button } from "@/components/ui/button";

import type { ServiceEntry } from "@/lib/dashboard-data";

import { openServiceDetails } from "./store";

export function ServiceDetailsTrigger({
	entry,
	children,
	className,
}: {
	entry: ServiceEntry;
	children?: React.ReactNode;
	className?: string;
}) {
	return (
		<Button
			variant="outline"
			size="sm"
			className={className}
			onClick={() => openServiceDetails(entry)}
		>
			{children ?? "Ver"}
			<ExternalLink className="size-3" />
		</Button>
	);
}
