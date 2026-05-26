import * as React from "react";

import { View } from "react-native";

import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";

import { cn } from "@/lib/utils";

type FieldOrientation = "vertical" | "horizontal" | "responsive";

type ValidationError = { message?: string } | undefined;

type FieldProps = React.ComponentPropsWithoutRef<typeof View> & {
	label?: React.ReactNode;
	description?: React.ReactNode;
	error?: React.ReactNode | ValidationError[] | null;
	orientation?: FieldOrientation;
	invalid?: boolean;
};

type FieldContentProps = React.ComponentPropsWithoutRef<typeof View>;

type FieldErrorProps = React.ComponentPropsWithoutRef<typeof Text> & {
	errors?: ValidationError[] | null;
};

const FieldContext = React.createContext<{
	labelId?: string;
	descriptionId?: string;
	errorId?: string;
	invalid?: boolean;
} | null>(null);

function useFieldContext() {
	return React.useContext(FieldContext);
}

function FieldSet({
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof View>) {
	return (
		<View
			accessibilityRole="group"
			className={cn("gap-4", className)}
			{...props}
		/>
	);
}

function FieldGroup({
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof View>) {
	return <View className={cn("gap-4", className)} {...props} />;
}

function FieldContent({ className, ...props }: FieldContentProps) {
	return <View className={cn("gap-1.5", className)} {...props} />;
}

function FieldTitle({
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof Text>) {
	return (
		<Text
			className={cn("text-sm font-medium text-foreground", className)}
			{...props}
		/>
	);
}

function FieldLegend({
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof Label>) {
	return (
		<Label
			className={cn("text-base font-semibold text-foreground", className)}
			{...props}
		/>
	);
}

function FieldLabel({
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof Label>) {
	const context = useFieldContext();

	return (
		<Label
			nativeID={context?.labelId}
			className={cn("text-sm font-medium text-foreground", className)}
			{...props}
		/>
	);
}

function FieldDescription({
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof Text>) {
	const context = useFieldContext();

	return (
		<Text
			nativeID={context?.descriptionId}
			className={cn("text-sm text-muted-foreground", className)}
			variant="muted"
			{...props}
		/>
	);
}

function FieldError({ errors, className, ...props }: FieldErrorProps) {
	const context = useFieldContext();
	const messages = errors?.map((error) => error?.message).filter(Boolean) as
		| string[]
		| undefined;

	if (!messages?.length && !props.children) {
		return null;
	}

	return (
		<Text
			nativeID={context?.errorId}
			accessibilityRole="alert"
			accessibilityLiveRegion="polite"
			className={cn("text-destructive text-sm", className)}
			{...props}
		>
			{messages?.length ? messages.join("\n") : props.children}
		</Text>
	);
}

function Field({
	children,
	className,
	label,
	description,
	error,
	orientation = "vertical",
	invalid,
	...props
}: FieldProps) {
	const reactId = React.useId();
	const labelId = label ? `${reactId}-label` : undefined;
	const descriptionId = description ? `${reactId}-description` : undefined;
	const errorId = error ? `${reactId}-error` : undefined;
	const hasError = Boolean(error) || Boolean(invalid);

	return (
		<FieldContext.Provider
			value={{ labelId, descriptionId, errorId, invalid: hasError }}
		>
			<View
				accessibilityRole="group"
				accessibilityState={{ invalid: hasError }}
				className={cn(
					"gap-1.5",
					orientation === "horizontal" &&
						"flex-row items-center gap-3",
					orientation === "responsive" &&
						"@container/field flex-col gap-3",
					className,
				)}
				{...props}
			>
				{label ? (
					<FieldLabel nativeID={labelId}>{label}</FieldLabel>
				) : null}
				{description ? (
					<FieldDescription nativeID={descriptionId}>
						{description}
					</FieldDescription>
				) : null}
				{children}
				{error ? (
					<FieldError nativeID={errorId}>{error}</FieldError>
				) : null}
			</View>
		</FieldContext.Provider>
	);
}

export type { FieldOrientation, ValidationError };
export {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
	FieldTitle,
};
