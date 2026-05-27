interface Props {
	label: string;
	children: React.ReactNode;
}

export function DetailsSection({ label, children }: Props) {
	return (
		<div className="space-y-2">
			<h3 className="font-semibold text-sm text-muted-foreground uppercase">
				{label}
			</h3>
			{children}
		</div>
	);
}
