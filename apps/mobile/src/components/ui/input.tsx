import * as React from "react";

import { Platform, TextInput, View } from "react-native";

import { cn } from "@/lib/utils";

const InputWrapperContext = React.createContext(false);

function InputWrapper({
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof View>) {
	return (
		<InputWrapperContext.Provider value>
			<View
				className={cn(
					"dark:bg-input/50 border-border dark:border-input bg-background text-foreground flex h-11 w-full min-w-0 flex-row items-center gap-2 rounded-md border px-3 py-1 shadow-sm shadow-black/5 sm:h-9 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
					className,
				)}
				{...props}
			/>
		</InputWrapperContext.Provider>
	);
}

function Input({
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof TextInput>) {
	const isInsideWrapper = React.useContext(InputWrapperContext);
	const inputClassName = isInsideWrapper
		? cn(
				"text-foreground flex h-full min-w-0 flex-1 bg-transparent px-0 py-0 text-base leading-5 outline-none md:text-sm",
				props.editable === false &&
					cn(
						"opacity-50",
						Platform.select({
							web: "disabled:pointer-events-none disabled:cursor-not-allowed",
						}),
					),
				Platform.select({
					web: cn(
						"placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground transition-[color,box-shadow]",
						"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
					),
					native: "placeholder:text-muted-foreground/50",
				}),
				className,
			)
		: cn(
				"dark:bg-input/50 border-border dark:border-input bg-background text-foreground flex h-11 w-full min-w-0 flex-row items-center rounded-md border py-1 text-base leading-5 shadow-sm shadow-black/5 sm:h-9 pl-3",
				props.editable === false &&
					cn(
						"opacity-50",
						Platform.select({
							web: "disabled:pointer-events-none disabled:cursor-not-allowed",
						}),
					),
				Platform.select({
					web: cn(
						"placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground outline-none transition-[color,box-shadow] md:text-sm",
						"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
						"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
					),
					native: "placeholder:text-muted-foreground/50",
				}),
				className,
			);
	return <TextInput className={inputClassName} {...props} />;
}

export { Input, InputWrapper };
