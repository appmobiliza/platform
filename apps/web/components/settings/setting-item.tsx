"use client";

import type * as React from "react";

import {
	Field,
	FieldContent,
	FieldDescription,
	FieldTitle,
} from "@/components/ui/field";

import { cn } from "@/lib/utils";

type SettingItemProps = {
	title: string;
	description: string;
	content: React.ReactNode;
	className?: string;
	contentClassName?: string;
};

function SettingItem({
	title,
	description,
	content,
	className,
	contentClassName,
}: SettingItemProps) {
	return (
		<Field
			className={cn(
				"gap-4 p-5 md:flex-row md:items-center md:justify-between",
				className,
			)}
		>
			<FieldContent className="gap-1.5 leading-normal">
				<FieldTitle>{title}</FieldTitle>
				<FieldDescription>{description}</FieldDescription>
			</FieldContent>
			<div className={cn("w-full md:w-auto", contentClassName)}>
				{content}
			</div>
		</Field>
	);
}

export { SettingItem };
