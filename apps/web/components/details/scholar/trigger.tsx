"use client";

import type * as React from "react";

import { Button } from "@/components/ui/button";

import type { CachedScholar } from "@/lib/cached-data";

import {
	closeScholarDetails,
	openScholarDetails,
	useScholarDetailsEntry,
} from "./store";

export function ScholarDetailsTrigger({
	scholar,
	children,
	className,
}: {
	scholar: CachedScholar;
	children?: React.ReactNode;
	className?: string;
}) {
	const { isOpen, item } = useScholarDetailsEntry();

	const isCurrentScholarOpen = isOpen && item?.user.id === scholar.user.id;

	return (
		<Button
			className={className}
			onClick={() =>
				isCurrentScholarOpen
					? closeScholarDetails()
					: openScholarDetails(scholar)
			}
		>
			{children ??
				(isCurrentScholarOpen ? "Fechar detalhe" : "Ver detalhe")}
		</Button>
	);
}
