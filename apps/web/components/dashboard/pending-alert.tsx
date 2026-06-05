"use client";

import { TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PendingAlertData {
	createdAt: string;
	name: string;
}

/**
 * Alerta de espera que calcula o delay no cliente.
 * Recebe os dados da solicitação pendente mais antiga do servidor
 * e calcula o tempo de espera real no cliente via `Date.now()`.
 *
 * Isso evita que o RSC payload mude a cada requisição
 * (já que `Date.now()` ficava no servidor), permitindo
 * que o Router Cache funcione corretamente.
 */
export function PendingAlert({ data }: { data: PendingAlertData | null }) {
	const [delay, setDelay] = useState(0);

	useEffect(() => {
		if (!data) return;

		function update() {
			if (!data) return;
			setDelay(
				Math.max(
					1,
					Math.floor(
						(Date.now() - new Date(data.createdAt).getTime()) /
							60_000,
					),
				),
			);
		}

		update();
		const interval = setInterval(update, 60_000);
		return () => clearInterval(interval);
	}, [data]);

	if (!data) return null;

	return (
		<Alert variant={"warning"}>
			<TriangleAlert className="h-4 w-4" />
			<AlertTitle>Alerta de espera</AlertTitle>
			<AlertDescription>
				A solicitação de {data.name} aguarda resposta há {delay} min.
				Nenhum bolsista aceitou ainda.
			</AlertDescription>
		</Alert>
	);
}
