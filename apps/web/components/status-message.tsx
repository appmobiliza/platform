import { cn } from "@/lib/utils";

interface Props {
	className?: string;
	title: string;
	description: string;
	icon?: React.ReactNode;
}

export function StatusMessage({ className, title, description, icon }: Props) {
	return (
		<div
			className={cn(
				"flex min-w-0 flex-col items-center justify-center gap-2 p-6 text-center max-w-full overflow-hidden",
				className,
			)}
		>
			{icon}
			<h2 className="text-lg font-semibold wrap-break-word">{title}</h2>
			<p className="text-sm text-muted-foreground wrap-break-word">
				{description}
			</p>
		</div>
	);
}
