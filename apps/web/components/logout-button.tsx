"use client";

import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";

import { useLogout } from "@/hooks/use-logout";

type Props = ComponentProps<typeof Button>;

export function LogoutButton({ children, ...props }: Props) {
	const { handleLogout, isLoggingOut } = useLogout();

	return (
		<Button
			type="button"
			onClick={handleLogout}
			disabled={isLoggingOut || props.disabled}
			{...props}
		>
			{isLoggingOut ? (
				<>
					<Loader2 className="size-4 animate-spin" />
					{children ?? "Sair"}
				</>
			) : (
				(children ?? "Sair")
			)}
		</Button>
	);
}
