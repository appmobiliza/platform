"use client";

type SectionTitleProps = {
	children: string;
	className?: string;
};

function SectionTitle({ children, className }: SectionTitleProps) {
	return (
		<p
			className={
				className ??
				"text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground"
			}
		>
			{children}
		</p>
	);
}

export { SectionTitle };
