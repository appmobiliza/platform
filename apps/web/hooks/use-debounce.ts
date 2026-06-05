"use client";

import { useEffect, useState } from "react";

/**
 * Retorna um valor estabilizado que só é atualizado após `delay` ms
 * de inatividade. Útil para evitar filtragens/disparos a cada tecla.
 *
 * @example
 * const [query, setQuery] = useState("");
 * const debouncedQuery = useDebounce(query, 300);
 * // usa debouncedQuery para filtrar / chamar API
 */
export function useDebounce<T>(value: T, delay: number): T {
	const [debounced, setDebounced] = useState(value);

	useEffect(() => {
		const timer = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(timer);
	}, [value, delay]);

	return debounced;
}
