import { cn } from "@/lib/utils";

import EndPoint from "./temp-icons/end-point";
import StartPoint from "./temp-icons/start-point";

export function RoutePreview({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"flex w-full flex-row items-start justify-start gap-4",
				className,
			)}
		>
			<div className="flex flex-col items-center justify-start gap-2">
				<StartPoint />
				<div className="h-4 w-0.5 bg-primary" />
				<EndPoint />
			</div>

			<div className="flex w-full flex-col gap-3.75 text-base font-medium">
				<span className="flex h-7 items-center">
					Instituto de Computação
				</span>

				<div className="h-px w-full bg-border" />

				<span className="flex h-7 items-center">
					Biblioteca Central
				</span>
			</div>
		</div>
	);
}
