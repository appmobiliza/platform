"use client";

import type * as React from "react";

import { ChevronRight } from "lucide-react";

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
			variant={"outline"}
			className={className}
			onClick={() => openStudentDetails(student)}
		>
			{children ?? "Ver detalhes"}
			<ChevronRight className="ml-2" size={16} />
		</Button>
	);
}
