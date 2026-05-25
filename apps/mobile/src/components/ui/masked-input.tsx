import { useState } from "react";

import { cleanCpf, cleanPhone, formatCpf, formatPhone } from "@/utils";

import { Input } from "./input";

type MaskType = "phone" | "cpf";

interface MaskedInputProps
	extends React.ComponentPropsWithoutRef<typeof Input> {
	mask: MaskType;
}

const DEFAULT_KEYBOARD_BY_MASK: Record<
	MaskType,
	NonNullable<MaskedInputProps["keyboardType"]>
> = {
	phone: "phone-pad",
	cpf: "number-pad",
};

const DEFAULT_MAX_LENGTH_BY_MASK: Record<MaskType, number> = {
	phone: 15,
	cpf: 14,
};

function formatMaskedValue(mask: MaskType, value: string): string {
	if (mask === "phone") {
		return formatPhone(value);
	}

	return formatCpf(value);
}

function cleanMaskedValue(mask: MaskType, value: string): string {
	if (mask === "phone") {
		return cleanPhone(value);
	}

	return cleanCpf(value);
}

function MaskedInput({
	mask,
	keyboardType,
	maxLength,
	onChangeText,
	value,
	...props
}: MaskedInputProps) {
	const [internalValue, setInternalValue] = useState("");
	const isControlled = value !== undefined;
	const sourceValue = isControlled ? value : internalValue;
	const formattedValue = sourceValue
		? formatMaskedValue(mask, sourceValue)
		: "";
	const resolvedKeyboardType = keyboardType ?? DEFAULT_KEYBOARD_BY_MASK[mask];
	const resolvedMaxLength = maxLength ?? DEFAULT_MAX_LENGTH_BY_MASK[mask];

	return (
		<Input
			{...props}
			keyboardType={resolvedKeyboardType}
			maxLength={resolvedMaxLength}
			value={formattedValue}
			onChangeText={(text) => {
				const cleanedValue = cleanMaskedValue(mask, text);
				const nextValue = formatMaskedValue(mask, cleanedValue);
				if (!isControlled) {
					setInternalValue(nextValue);
				}
				onChangeText?.(nextValue);
			}}
		/>
	);
}

export { MaskedInput };
