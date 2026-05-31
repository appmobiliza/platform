"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Switch } from "@/components/ui/switch";

import { trpc } from "@/providers/trpc-provider";

export function LocationStatusSwitch({
	id,
	isActive,
	name,
}: {
	id: number;
	isActive: boolean;
	name: string;
}) {
	const router = useRouter();
	const [checked, setChecked] = useState(isActive);
	const setActive = trpc.locations.setActive.useMutation({
		onError() {
			setChecked(isActive);
		},
		onSuccess() {
			router.refresh();
		},
	});

	return (
		<Switch
			size="lg"
			checked={checked}
			disabled={setActive.isPending}
			aria-label={`${checked ? "Desativar" : "Ativar"} local ${name}`}
			onCheckedChange={(nextChecked) => {
				setChecked(nextChecked);
				setActive.mutate({ id, isActive: nextChecked });
			}}
		/>
	);
}
