"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Switch } from "@/components/ui/switch";

import { trpc } from "@/providers/trpc-provider";

interface LocationStatusSwitchProps {
	id: string;
	isActive: boolean;
	name: string;
}

export function LocationStatusSwitch({
	id,
	isActive,
	name,
}: LocationStatusSwitchProps) {
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
				setActive.mutate({ id: id, isActive: nextChecked });
			}}
		/>
	);
}
