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

	React.useEffect(() => {
		setIsActive(active);
	}, [active]);

	React.useEffect(() => {
		setIsExpanded(defaultExpanded);
	}, [defaultExpanded]);

	const toggleExpanded = () => {
		if (!isActive) {
			return;
		}

		setIsExpanded((current) => !current);
	};

	return (
		<Card className="gap-0 overflow-hidden rounded-xl border border-border/80 bg-card py-0 shadow-none ring-0">
			<div className="flex items-center gap-4 border-b border-border/80 p-5">
				<button
					type="button"
					className={cn(
						"flex min-w-0 flex-1 items-center gap-4 text-left",
						isActive && "cursor-pointer",
					)}
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
						<p className="truncate text-sm text-muted-foreground">
							{description}
						</p>
					</div>
				</button>

				<div className="flex shrink-0 items-center gap-2">
					<Switch
						checked={isActive}
						onCheckedChange={(checked) => {
							setIsActive(Boolean(checked));
							setIsExpanded(Boolean(checked));
						}}
						size="default"
						className="h-6 w-11 bg-muted data-checked:bg-primary"
					/>
					<ChevronDown
						className={cn(
							"size-4 shrink-0 text-muted-foreground transition-transform",
							isExpanded && isActive && "rotate-180",
						)}
					/>
				</div>
			</div>

			{children && isActive && isExpanded ? (
				<div className="space-y-6 p-5 md:p-6">{children}</div>
			) : null}
		</Card>
	);
}

export { ShiftCard };
