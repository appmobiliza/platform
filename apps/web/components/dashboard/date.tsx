"use client";

import { useEffect, useState } from "react";

/**
 * Exibe a data atual formatada em português no cliente.
 * Evita hydration mismatch usando estado + effect.
 */
export function DashboardDate() {
	const [date, setDate] = useState("");

	useEffect(() => {
		setDate(
			new Date().toLocaleDateString("pt-BR", {
				weekday: "long",
				day: "2-digit",
				month: "long",
				year: "numeric",
			}),
		);
	}, []);

	if (!date) return null;

	return <h2 className="text-sm text-muted-foreground">{date}</h2>;
}
