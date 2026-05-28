"use client";

import * as React from "react";

import { ChevronDown, type LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

import { cn } from "@/lib/utils";

type ShiftCardProps = {
	icon: LucideIcon;
	iconClassName: string;
	title: string;
	description: string;
	active: boolean;
	defaultExpanded?: boolean;
	children?: React.ReactNode;
};

function ShiftCard({
	icon: Icon,
	iconClassName,
	title,
	description,
	active,
	defaultExpanded = active,
	children,
}: ShiftCardProps) {
	const [isActive, setIsActive] = React.useState(active);
	const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

	const toggleExpanded = () => {
		if (!isActive) {
			return;
		}

		setIsExpanded((current) => !current);
	};

	return (
		<Card className="gap-0 overflow-hidden rounded-xl border border-border/80 bg-card py-0 shadow-none ring-0">
			<button
				onClick={toggleExpanded}
				onKeyDown={(event) => {
					if (!isActive) {
						return;
					}

					if (event.key === "Enter" || event.key === " ") {
						event.preventDefault();
						toggleExpanded();
					}
				}}
				type="button"
				className={cn(
					"flex min-w-0 flex-1 items-center gap-4 border-border/80 p-5  text-left cursor-default z-0",
					isActive && "border-b -mb-px cursor-pointer",
				)}
			>
				<div
					className={cn(
						"flex size-12 shrink-0 items-center justify-center rounded-lg",
						iconClassName,
					)}
				>
					<Icon className="size-6" />
				</div>
				<div className="min-w-0 flex-1">
					<p className="text-sm font-medium text-foreground">
						{title}
					</p>
					<p className="truncate text-xs mt-1 md:mt-0 md:text-sm text-muted-foreground">
						{isActive ? description : "Desativado"}
					</p>
				</div>

				<div className="flex shrink-0 items-center gap-2">
					<Switch
						checked={isActive}
						onCheckedChange={(checked, eventDetails) => {
							eventDetails.event.preventDefault();
							setIsActive(Boolean(checked));
							setIsExpanded(Boolean(checked));
						}}
						size="lg"
						className="cursor-default"
					/>
					<ChevronDown
						className={cn(
							"size-4 shrink-0 text-muted-foreground transition-transform hidden md:flex",
							isExpanded && isActive && "rotate-180",
						)}
					/>
				</div>
			</button>
			{children ? (
				<div
					data-state={isActive && isExpanded ? "open" : "closed"}
					className="grid transition-[grid-template-rows,opacity] duration-300 ease-in-out data-[state=open]:grid-rows-[1fr] data-[state=open]:opacity-100 data-[state=closed]:grid-rows-[0fr] data-[state=closed]:opacity-0"
				>
					<div className="min-h-0 overflow-hidden">
						<div className="space-y-6 p-5 md:p-6">{children}</div>
					</div>
				</div>
			) : null}
		</Card>
	);
}

export { ShiftCard };
