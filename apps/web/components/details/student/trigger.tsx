"use client";

import type * as React from "react";

import { Button } from "@/components/ui/button";

import type { StudentData } from "@/data/students-data";

import { openStudentDetails } from "./store";

export function StudentDetailsTrigger({
	student,
	children,
	className,
}: {
	student: StudentData;
	children?: React.ReactNode;
	className?: string;
}) {
	return (
		<Button
			className={className}
			onClick={() => openStudentDetails(student)}
		>
			{children ?? "Ver detalhe"}
		</Button>
	);
}
