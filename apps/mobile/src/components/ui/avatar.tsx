import * as AvatarPrimitive from "@rn-primitives/avatar";
import { Text } from "react-native";

import { cn } from "@/lib/utils";

function Avatar({
	className,
	...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
	return (
		<AvatarPrimitive.Root
			className={cn(
				"relative flex size-8 shrink-0 overflow-hidden rounded-full",
				className,
			)}
			{...props}
		/>
	);
}

function AvatarImage({
	className,
	...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
	return (
		<AvatarPrimitive.Image
			className={cn("aspect-square size-full", className)}
			{...props}
		/>
	);
}

function AvatarFallback({
	className,
	children,
	style,
	...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
	return (
		<AvatarPrimitive.Fallback
			className={cn(
				"bg-muted flex size-full flex-row items-center justify-center rounded-full",
				className,
			)}
			style={style}
			{...props}
		>
			{typeof children === "string" ? (
				<Text
					style={[style, { color: (style as any)?.color }]}
					className={className}
				>
					{children}
				</Text>
			) : (
				children
			)}
		</AvatarPrimitive.Fallback>
	);
}

export { Avatar, AvatarFallback, AvatarImage };
