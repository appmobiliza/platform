"use client";

import {
	cleanCpf,
	cleanPhone,
	formatCpf,
	formatPhone,
} from "@mobiliza/contracts";

import * as React from "react";

import { Input } from "./input";

type MaskType = "phone" | "cpf" | "enrollment";

interface MaskedInputProps
	extends Omit<React.ComponentPropsWithoutRef<typeof Input>, "onChange"> {
	mask: MaskType;
	onChange?: (value: string) => void;
}

const FORMATTERS: Record<MaskType, (value: string) => string> = {
	phone: formatPhone,
	cpf: formatCpf,
	enrollment: (value: string) => value.replace(/\D/g, ""),
};

const CLEANERS: Record<MaskType, (value: string) => string> = {
	phone: cleanPhone,
	cpf: cleanCpf,
	enrollment: (value: string) => value.replace(/\D/g, ""),
};

const MAX_LENGTHS: Record<MaskType, number> = {
	phone: 15,
	cpf: 14,
	enrollment: 20,
};

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
	({ mask, onChange, value, maxLength, ...props }, ref) => {
		const [internalValue, setInternalValue] = React.useState("");
		const isControlled = value !== undefined;
		const sourceValue = isControlled ? String(value) : internalValue;
		const formattedValue = sourceValue ? FORMATTERS[mask](sourceValue) : "";
		const resolvedMaxLength = maxLength ?? MAX_LENGTHS[mask];

		return (
			<Input
				ref={ref}
				{...props}
				value={formattedValue}
				maxLength={resolvedMaxLength}
				onChange={(e) => {
					const rawValue = e.target.value;
					const cleanedValue = CLEANERS[mask](rawValue);
					const nextValue = FORMATTERS[mask](cleanedValue);

					if (!isControlled) {
						setInternalValue(nextValue);
					}

					// Pass the formatted value directly — field.onChange from
					// react-hook-form's Controller accepts both events and values.
					onChange?.(nextValue);
				}}
			/>
		);
	},
);

MaskedInput.displayName = "MaskedInput";

export type { MaskedInputProps, MaskType };
export { MaskedInput };
