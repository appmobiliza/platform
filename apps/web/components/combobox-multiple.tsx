"use client";

import { XIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
	Combobox,
	ComboboxChip,
	ComboboxChips,
	ComboboxChipsInput,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxItem,
	ComboboxList,
	ComboboxValue,
	useComboboxAnchor,
} from "@/components/ui/combobox";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface Props {
	className?: string;
	items: Array<{ id: string; label: string }>;
	allLabel: string;
	value?: string[];
	onValueChange?: (value: string[]) => void;
}

export function ComboboxMultiple({
	className,
	items,
	allLabel,
	value: controlledValue,
	onValueChange,
}: Props) {
	const anchor = useComboboxAnchor();
	const chipsRef = React.useRef<HTMLDivElement | null>(null);
	const isMobile = useIsMobile();
	const itemLabels = React.useMemo(
		() => items.map((item) => item.label),
		[items],
	);

	// Usa estado interno quando as props não são fornecidas
	const [internalValue, setInternalValue] = React.useState<string[]>([
		allLabel,
	]);
	const resolvedValue = controlledValue ?? internalValue;

	const [isOverflowing, setIsOverflowing] = React.useState(false);

	// Usamos uma ref para ter o valor atual SEM depender da renderização
	// (evita stale closures e loops infinitos).
	const resolvedValueRef = React.useRef(resolvedValue);
	resolvedValueRef.current = resolvedValue;

	const computeAfterRemove = React.useCallback(
		(currentValues: string[], removedValue: string) => {
			if (removedValue === allLabel) return [];
			const next = currentValues.filter(
				(v) => v !== removedValue && v !== allLabel,
			);
			if (next.length === itemLabels.length) return [allLabel];
			return next;
		},
		[allLabel, itemLabels.length],
	);

	const computeAfterChange = React.useCallback(
		(currentValues: string[], nextValues: string[]) => {
			const nextHasAll = nextValues.includes(allLabel);
			const currentHasAll = currentValues.includes(allLabel);

			if (currentHasAll && nextHasAll && nextValues.length > 1) {
				return nextValues.filter((v) => v !== allLabel);
			}
			if (nextHasAll) return [allLabel];

			const nextSelected = nextValues.filter((v) => v !== allLabel);
			if (nextSelected.length === itemLabels.length) return [allLabel];
			return nextSelected;
		},
		[allLabel, itemLabels.length],
	);

	const handleRemoveValue = React.useCallback(
		(removedValue: string) => {
			if (onValueChange) {
				// Modo controlado: chama o callback diretamente com o valor atual
				onValueChange(
					computeAfterRemove(resolvedValueRef.current, removedValue),
				);
			} else {
				setInternalValue((prev) =>
					computeAfterRemove(prev, removedValue),
				);
			}
		},
		[onValueChange, computeAfterRemove],
	);

	const handleValueChange = React.useCallback(
		(nextValues: string[]) => {
			if (onValueChange) {
				// Modo controlado: chama o callback diretamente com o valor atual
				onValueChange(
					computeAfterChange(resolvedValueRef.current, nextValues),
				);
			} else {
				setInternalValue((prev) =>
					computeAfterChange(prev, nextValues),
				);
			}
		},
		[onValueChange, computeAfterChange],
	);

	// layout effect para overflow
	React.useLayoutEffect(() => {
		if (isMobile) {
			setIsOverflowing(false);
			return;
		}
		const update = () => {
			const chipsW = chipsRef.current?.clientWidth ?? 0;
			const scrollW = chipsRef.current?.scrollWidth ?? 0;
			setIsOverflowing(scrollW > chipsW);
		};
		update();
		const ro = new ResizeObserver(update);
		if (chipsRef.current) ro.observe(chipsRef.current);
		return () => ro.disconnect();
	}, [isMobile]);

	// Trunca chips no desktop quando estourar
	const displayedValues = React.useMemo(() => {
		if (isMobile || !isOverflowing || resolvedValue.length <= 1) {
			return resolvedValue;
		}
		return resolvedValue.slice(0, 1);
	}, [isMobile, isOverflowing, resolvedValue]);
	const hiddenCount = resolvedValue.length - displayedValues.length;

	return (
		<Combobox
			multiple
			autoHighlight
			items={[allLabel, ...itemLabels]}
			value={resolvedValue}
			onValueChange={handleValueChange}
		>
			<ComboboxChips
				ref={anchor}
				className={cn(
					"relative min-h-10 h-auto items-start md:flex-nowrap md:overflow-hidden",
					className,
				)}
			>
				{/* invisível para medir o scroll */}
				<div
					ref={chipsRef}
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 -z-10 flex w-max flex-nowrap items-center gap-1.5 overflow-hidden opacity-0"
				>
					{resolvedValue.map((v) => (
						<ComboboxChip key={v} showRemove={false}>
							{v}
						</ComboboxChip>
					))}
					<span className="min-w-16" />
				</div>
				<ComboboxValue>
					{() => (
						<>
							{displayedValues.map((v) => (
								<ComboboxChip key={v} showRemove={false}>
									{v}
									<Button
										type="button"
										variant="ghost"
										size="icon-xs"
										data-slot="combobox-chip-remove"
										className="-ml-1 opacity-50 hover:opacity-100"
										onClick={() => handleRemoveValue(v)}
										aria-label={`Remover ${v}`}
									>
										<XIcon className="pointer-events-none" />
									</Button>
								</ComboboxChip>
							))}
							{hiddenCount > 0 && (
								<ComboboxChip showRemove={false}>
									+ {hiddenCount}
								</ComboboxChip>
							)}
							<ComboboxChipsInput className="min-w-16 flex-1" />
						</>
					)}
				</ComboboxValue>
			</ComboboxChips>
			<ComboboxContent anchor={anchor}>
				<ComboboxEmpty>Nenhum item encontrado.</ComboboxEmpty>
				<ComboboxList>
					{(item: string) => (
						<ComboboxItem key={item} value={item}>
							{item}
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	);
}
