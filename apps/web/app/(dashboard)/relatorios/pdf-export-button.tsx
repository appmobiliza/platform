"use client";

import { FileDown } from "lucide-react";
import type * as React from "react";

import { Button } from "@/components/ui/button";

type PdfExportButtonProps = Omit<
	React.ComponentProps<typeof Button>,
	"onClick" | "type"
>;

export function PdfExportButton({
	children = "Exportar PDF",
	className,
	...props
}: PdfExportButtonProps) {
	return (
		<Button
			type="button"
			className={["gap-2", className].filter(Boolean).join(" ")}
			onClick={() => window.print()}
			{...props}
		>
			<FileDown className="size-4" />
			{children}
		</Button>
	);
}
