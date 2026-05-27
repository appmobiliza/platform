"use client";

import type * as React from "react";

import { ExternalLink } from "lucide-react";

import { openServiceDetails } from "@/components/service-details-store";
import type { ServiceEntry } from "@/components/services-data";
import { Button } from "@/components/ui/button";

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
