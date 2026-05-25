import * as React from "react";

import {
	BottomSheetBackdrop,
	BottomSheetModal,
	BottomSheetModalProvider,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import { cva } from "class-variance-authority";
import type { PressableProps, ViewProps } from "react-native";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";

import { cn } from "@/lib/utils";

const DEFAULT_SNAP_POINTS: Array<string | number> = ["50%"];

type SheetContextValue = {
	modalRef: React.RefObject<BottomSheetModal | null>;
	openSheet: () => void;
	closeSheet: () => void;
};

const SheetStateContext = React.createContext<SheetContextValue | null>(null);

function useSheetState() {
	const context = React.useContext(SheetStateContext);

	if (!context) {
		throw new Error("Sheet components must be used within <Sheet>.");
	}

	return context;
}

type SheetProps = React.PropsWithChildren<{
	defaultOpen?: boolean;
}>;

function Sheet({ children, defaultOpen = false }: SheetProps) {
	const modalRef = React.useRef<BottomSheetModal>(null);

	const openSheet = React.useCallback(() => {
		modalRef.current?.present();
	}, []);

	const closeSheet = React.useCallback(() => {
		modalRef.current?.dismiss();
	}, []);

	React.useEffect(() => {
		if (defaultOpen) {
			modalRef.current?.present();
		}
	}, [defaultOpen]);

	const contextValue = React.useMemo(
		() => ({
			modalRef,
			openSheet,
			closeSheet,
		}),
		[closeSheet, openSheet],
	);

	return (
		<BottomSheetModalProvider>
			<SheetStateContext.Provider value={contextValue}>
				{children}
			</SheetStateContext.Provider>
		</BottomSheetModalProvider>
	);
}

type SheetTriggerProps = React.PropsWithChildren<{
	asChild?: boolean;
	disabled?: boolean;
}>;

function SheetTrigger({
	asChild = false,
	children,
	disabled,
}: SheetTriggerProps) {
	const { openSheet } = useSheetState();

	const handlePress = React.useCallback(() => {
		if (!disabled) {
			openSheet();
		}
	}, [disabled, openSheet]);

	if (asChild) {
		const child = React.Children.only(children) as React.ReactElement<{
			onPress?: PressableProps["onPress"];
			disabled?: boolean;
		}>;

		const childOnPress = child.props.onPress;

		return React.cloneElement(child, {
			onPress: (event) => {
				childOnPress?.(event);
				handlePress();
			},
			disabled: child.props.disabled ?? disabled,
		});
	}

	return (
		<Pressable
			accessibilityRole="button"
			onPress={handlePress}
			disabled={disabled}
		>
			{children}
		</Pressable>
	);
}

type SheetContentProps = React.PropsWithChildren<{
	snapPoints?: Array<string | number>;
	index?: number;
	enablePanDownToClose?: boolean;
}> &
	React.ComponentPropsWithoutRef<typeof BottomSheetView>;

function SheetContent({
	children,
	snapPoints = DEFAULT_SNAP_POINTS,
	index = 0,
	enablePanDownToClose = true,
	className,
	style,
	...props
}: SheetContentProps) {
	const { modalRef, closeSheet } = useSheetState();

	const handleDismiss = React.useCallback(() => {
		closeSheet();
	}, [closeSheet]);

	const renderBackdrop = React.useCallback(
		(backdropProps: React.ComponentProps<typeof BottomSheetBackdrop>) => (
			<BottomSheetBackdrop
				{...backdropProps}
				appearsOnIndex={0}
				disappearsOnIndex={-1}
				pressBehavior="close"
			/>
		),
		[],
	);

	return (
		<BottomSheetModal
			ref={modalRef}
			index={index}
			snapPoints={snapPoints}
			enablePanDownToClose={enablePanDownToClose}
			onDismiss={handleDismiss}
			backdropComponent={renderBackdrop}
		>
			<BottomSheetView className={className} style={style} {...props}>
				{children}
			</BottomSheetView>
		</BottomSheetModal>
	);
}

function SheetHeader({ className, ...props }: ViewProps) {
	return <View className={cn("gap-1.5 px-4 pt-1", className)} {...props} />;
}

function SheetFooter({ className, ...props }: ViewProps) {
	return (
		<View className={cn("gap-3 px-4 pb-4 pt-2", className)} {...props} />
	);
}

function SheetTitle({
	className,
	...props
}: React.ComponentProps<typeof Text>) {
	return (
		<Text
			variant="h4"
			className={cn("text-foreground text-center", className)}
			{...props}
		/>
	);
}

function SheetDescription({
	className,
	...props
}: React.ComponentProps<typeof Text>) {
	return (
		<Text
			variant="muted"
			className={cn("text-muted-foreground text-center", className)}
			{...props}
		/>
	);
}

const sheetItemVariants = cva(
	"flex-row items-center justify-between rounded-xl px-4 py-3 active:opacity-80",
	{
		variants: {
			selected: {
				true: "bg-primary/10 border-primary/20 border",
				false: "bg-secondary/40",
			},
			disabled: {
				true: "opacity-50",
				false: "",
			},
		},
		defaultVariants: {
			selected: false,
			disabled: false,
		},
	},
);

type SheetItemProps = {
	label: string;
	selected?: boolean;
	disabled?: boolean;
	onPress?: () => void;
	className?: string;
};

function SheetItem({
	label,
	selected = false,
	disabled = false,
	onPress,
	className,
}: SheetItemProps) {
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{ selected, disabled }}
			disabled={disabled}
			onPress={onPress}
			className={cn(sheetItemVariants({ selected, disabled }), className)}
		>
			<Text
				className={cn(
					"text-base",
					selected && "text-primary font-semibold",
				)}
			>
				{label}
			</Text>
		</Pressable>
	);
}

type SheetCloseProps = React.PropsWithChildren<{
	asChild?: boolean;
}>;

function SheetClose({ asChild = false, children }: SheetCloseProps) {
	const { closeSheet } = useSheetState();

	if (asChild) {
		const child = React.Children.only(children) as React.ReactElement<{
			onPress?: PressableProps["onPress"];
		}>;

		const childOnPress = child.props.onPress;

		return React.cloneElement(child, {
			onPress: (event) => {
				childOnPress?.(event);
				closeSheet();
			},
		});
	}

	return <Pressable onPress={closeSheet}>{children}</Pressable>;
}

export type {
	SheetContentProps,
	SheetItemProps,
	SheetProps,
	SheetTriggerProps,
};
export {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetItem,
	SheetTitle,
	SheetTrigger,
};
