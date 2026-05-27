"use client";

import * as React from "react";

import { XIcon } from "lucide-react";

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

import { cn } from "@/lib/utils";

import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
	className?: string;
	users: Array<{ id: string; name: string }>;
	allLabel: string;
}

export function UserPicker({ className, users, allLabel }: Props) {
	const anchor = useComboboxAnchor();
	const chipsRef = React.useRef<HTMLDivElement | null>(null);
	const isMobile = useIsMobile();
	const userNames = React.useMemo(
		() => users.map((user) => user.name),
		[users],
	);
	const [value, setValue] = React.useState<string[]>([allLabel]);
	const [isOverflowing, setIsOverflowing] = React.useState(false);

	const handleRemoveValue = React.useCallback(
		(removedValue: string) => {
			setValue((currentValues) => {
				if (removedValue === allLabel) {
					return [];
				}

				const nextValues = currentValues.filter(
					(nextValue) =>
						nextValue !== removedValue && nextValue !== allLabel,
				);

				if (nextValues.length === userNames.length) {
					return [allLabel];
				}

				return nextValues;
			});
		},
		[allLabel, userNames.length],
	);

	const handleValueChange = React.useCallback(
		(nextValues: string[]) => {
			setValue((currentValues) => {
				const nextHasAll = nextValues.includes(allLabel);
				const currentHasAll = currentValues.includes(allLabel);

				if (currentHasAll && nextHasAll && nextValues.length > 1) {
					return nextValues.filter(
						(nextValue) => nextValue !== allLabel,
					);
				}

				if (nextHasAll) {
					return [allLabel];
				}

				const nextSelectedValues = nextValues.filter(
					(nextValue) => nextValue !== allLabel,
				);

				if (nextSelectedValues.length === userNames.length) {
					return [allLabel];
				}

				return nextSelectedValues;
			});
		},
		[allLabel, userNames.length],
	);

	React.useLayoutEffect(() => {
		if (isMobile) {
			setIsOverflowing(false);
			return;
		}

		const updateOverflowState = () => {
			const chipsWidth = chipsRef.current?.clientWidth ?? 0;
			const contentWidth = chipsRef.current?.scrollWidth ?? 0;

			setIsOverflowing(contentWidth > chipsWidth);
		};

		updateOverflowState();

		const resizeObserver = new ResizeObserver(updateOverflowState);

		if (chipsRef.current) {
			resizeObserver.observe(chipsRef.current);
		}

		return () => resizeObserver.disconnect();
	}, [isMobile]);

	const selectedValues = React.useMemo(() => {
		if (isMobile || !isOverflowing || value.length <= 1) {
			return value;
		}

		return value.slice(0, 1);
	}, [isMobile, isOverflowing, value]);
	const hiddenCount = value.length - selectedValues.length;

	return (
		<Combobox
			multiple
			autoHighlight
			items={[allLabel, ...userNames]}
			value={value}
			onValueChange={handleValueChange}
		>
			<ComboboxChips
				ref={anchor}
				className={cn(
					"relative min-h-10 h-auto items-start md:flex-nowrap md:overflow-hidden",
					className,
				)}
			>
				<div
					ref={chipsRef}
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 -z-10 flex w-max flex-nowrap items-center gap-1.5 overflow-hidden opacity-0"
				>
					{value.map((selectedValue) => (
						<ComboboxChip key={selectedValue} showRemove={false}>
							{selectedValue}
						</ComboboxChip>
					))}
					<span className="min-w-16" />
				</div>
				<ComboboxValue>
					{(values: string[]) => (
						<React.Fragment>
							{values.map((selectedValue: string) => (
								<ComboboxChip
									key={selectedValue}
									showRemove={false}
								>
									{selectedValue}
									<Button
										type="button"
										variant="ghost"
										size="icon-xs"
										data-slot="combobox-chip-remove"
										className="-ml-1 opacity-50 hover:opacity-100"
										onClick={() =>
											handleRemoveValue(selectedValue)
										}
										aria-label={`Remover ${selectedValue}`}
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
						</React.Fragment>
					)}
				</ComboboxValue>
			</ComboboxChips>
			<ComboboxContent anchor={anchor}>
				<ComboboxEmpty>No items found.</ComboboxEmpty>
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
