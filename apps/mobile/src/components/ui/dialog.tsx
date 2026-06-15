import * as DialogPrimitive from "@rn-primitives/dialog";
import type * as React from "react";
import { Platform, View, type ViewProps } from "react-native";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

function DialogOverlay({
	className,
	children,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
	return (
		<DialogPrimitive.Overlay
			className={cn(
				"bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-black/50 p-2",
				Platform.select({
					web: cn(
						"fixed cursor-default [&>*]:cursor-auto",
						"data-[state=open]:animate-in data-[state=open]:fade-in-0",
						"data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
					),
				}),
				className,
			)}
			{...props}
		>
			{children}
		</DialogPrimitive.Overlay>
	);
}

function DialogContent({
	className,
	portalHost,
	children,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
	portalHost?: string;
}) {
	return (
		<DialogPortal hostName={portalHost}>
			<DialogOverlay>
				<DialogPrimitive.Content
					className={cn(
						"bg-background border-border z-50 mx-auto flex w-full max-w-[calc(100%-2rem)] flex-col gap-4 rounded-lg border p-6 shadow-lg shadow-black/5 sm:max-w-lg",
						Platform.select({
							web: cn(
								"duration-200",
								"data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
								"data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
							),
						}),
						className,
					)}
					{...props}
				>
					{children}
				</DialogPrimitive.Content>
			</DialogOverlay>
		</DialogPortal>
	);
}

function DialogHeader({ className, ...props }: ViewProps) {
	return (
		<View
			className={cn(
				"flex flex-col gap-2 text-center sm:text-left",
				className,
			)}
			{...props}
		/>
	);
}

function DialogFooter({ className, ...props }: ViewProps) {
	return (
		<View
			className={cn(
				"flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
				className,
			)}
			{...props}
		/>
	);
}

function DialogTitle({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
	return (
		<DialogPrimitive.Title
			className={cn(
				"text-foreground text-lg font-semibold leading-none",
				className,
			)}
			{...props}
		/>
	);
}

function DialogDescription({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
	return (
		<DialogPrimitive.Description
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

export {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
};
