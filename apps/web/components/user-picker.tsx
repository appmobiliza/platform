"use client";

import * as React from "react";

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

interface Props {
	users: Array<{ id: string; name: string }>;
}

export function UserPicker({ users }: Props) {
	const anchor = useComboboxAnchor();

	return (
		<Combobox
			multiple
			autoHighlight
			items={users.map((user) => user.name)}
			defaultValue={null}
		>
			<ComboboxChips ref={anchor} className="w-full">
				<ComboboxValue>
					{(values) => (
						<React.Fragment>
							{values.map((value: string) => (
								<ComboboxChip key={value}>{value}</ComboboxChip>
							))}
							<ComboboxChipsInput />
						</React.Fragment>
					)}
				</ComboboxValue>
			</ComboboxChips>
			<ComboboxContent anchor={anchor}>
				<ComboboxEmpty>No items found.</ComboboxEmpty>
				<ComboboxList>
					{(item) => (
						<ComboboxItem key={item} value={item}>
							{item}
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	);
}
