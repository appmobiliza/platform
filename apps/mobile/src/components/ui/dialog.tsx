import * as DialogPrimitive from "@rn-primitives/dialog";
import { X } from "lucide-react-native";
import * as React from "react";
import { Platform, Text, View, type ViewProps } from "react-native";
import {
	FadeIn,
	FadeOut,
	SlideInDown,
	SlideOutDown,
} from "react-native-reanimated";
import { FullWindowOverlay as RNFullWindowOverlay } from "react-native-screens";

import { Icon } from "@/components/ui/icon";
import { NativeOnlyAnimatedView } from "@/components/ui/native-only-animated-view";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const FullWindowOverlay =
	Platform.OS === "ios" ? RNFullWindowOverlay : React.Fragment;

function DialogOverlay({ children }: { children?: React.ReactNode }) {
	if (Platform.OS === "web") {
		return (
			<DialogPrimitive.Overlay
				className={cn(
					"bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-black/50 p-2 animate-in fade-in-0 fixed cursor-default [&>*]:cursor-auto",
				)}
			>
				{children}
			</DialogPrimitive.Overlay>
		);
	}

	return (
		<FullWindowOverlay>
			{/* Custom backdrop — plain style, no NativeWind */}
			<DialogPrimitive.Close
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
				}}
			>
				<NativeOnlyAnimatedView
					entering={FadeIn.duration(200)}
					exiting={FadeOut.duration(150)}
					style={{
						flex: 1,
						backgroundColor: "rgba(0, 0, 0, 0.5)",
					}}
				/>
			</DialogPrimitive.Close>

			{/* Content — slides up from bottom */}
			<View
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					justifyContent: "center",
					alignItems: "center",
					padding: 8,
				}}
				pointerEvents="box-none"
			>
				<NativeOnlyAnimatedView
					entering={SlideInDown.duration(300).springify()}
					exiting={SlideOutDown.duration(200)}
				>
					{children}
				</NativeOnlyAnimatedView>
			</View>
		</FullWindowOverlay>
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
							web: "animate-in fade-in-0 zoom-in-95 duration-200",
						}),
						className,
					)}
					{...props}
				>
					<>{children}</>
					<DialogPrimitive.Close
						className={cn(
							"absolute right-4 top-4 rounded opacity-70 active:opacity-100",
							Platform.select({
								web: "ring-offset-background focus:ring-ring data-[state=open]:bg-accent transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2",
							}),
						)}
						hitSlop={12}
					>
						<Icon icon={X} size={16} color="--accent-foreground" />
						<Text className="sr-only">Close</Text>
					</DialogPrimitive.Close>
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
