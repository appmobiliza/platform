"use client";

import { useEffect, useState } from "react";

import { Save } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "../ui/button";

type FloatingSavePanelProps = {
	threshold?: number;
	label?: string;
	loading?: boolean;
	onSave?: () => void;
	className?: string;
};

export function FloatingSaveChangesPanel({
	threshold = 300,
	label = "Salvar alterações",
	loading,
	onSave,
	className,
}: FloatingSavePanelProps) {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		function handleScroll() {
			setVisible(window.scrollY > threshold);
		}

		handleScroll();

		window.addEventListener("scroll", handleScroll, {
			passive: true,
		});

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [threshold]);

	return (
		<div
			className={cn(
				"pointer-events-none fixed inset-x-0 bottom-0 z-50 block md:hidden",
				"transition-all duration-300 ease-out",
				visible
					? "translate-y-0 opacity-100"
					: "translate-y-6 opacity-0",
			)}
		>
			{/* Gradiente superior */}
			{/* <div
				className={cn(
					"h-16 w-full",
					"bg-linear-to-t",
					"from-background via-background/10 to-transparent",
				)}
			/> */}

			{/* Painel */}
			<div
				className={cn(
					"pointer-events-auto border-t bg-background/95 backdrop-blur",
					"supports-backdrop-filter:bg-background/80",
					className,
				)}
			>
				<div className="mx-auto flex max-w-7xl items-center justify-end p-4">
					<Button
						onClick={onSave}
						disabled={loading}
						className={cn(
							"bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
							"shadow-lg transition-all",
							"hover:opacity-90",
							"disabled:pointer-events-none disabled:opacity-50",
						)}
					>
						<Save className="size-4" />

						{loading ? "Salvando..." : label}
					</Button>
				</div>
			</div>
		</div>
	);
}
