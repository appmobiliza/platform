import { Platform, TextInput } from "react-native";

import { cn } from "@/lib/utils";

const inputClassName =
	"dark:bg-input/50 border-border dark:border-input bg-background text-foreground flex h-11 w-full min-w-0 flex-row items-center rounded-md border py-1 text-base leading-5 shadow-sm shadow-black/5 sm:h-9 pl-3";

const inputDisabledClassName = cn(
	"opacity-50",
	Platform.select({
		web: "disabled:pointer-events-none disabled:cursor-not-allowed",
	}),
);

const inputWebClassName = cn(
	"placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground outline-none transition-[color,box-shadow] md:text-sm",
	"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
	"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
);

const inputNativeClassName = "placeholder:text-muted-foreground/50";

function Input({
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof TextInput>) {
	return (
		<TextInput
			className={cn(
				inputClassName,
				props.editable === false && inputDisabledClassName,
				Platform.select({
					web: inputWebClassName,
					native: inputNativeClassName,
				}),
				className,
			)}
			{...props}
		/>
	);
}

export {
	Input,
	inputClassName,
	inputDisabledClassName,
	inputNativeClassName,
	inputWebClassName,
};
