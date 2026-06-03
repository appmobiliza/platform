import {
	BottomSheetBackdrop,
	BottomSheetModal,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import { cva } from "class-variance-authority";
import { CheckIcon } from "lucide-react-native";
import * as React from "react";
import type { PressableProps, ViewProps } from "react-native";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";

import { THEME } from "@/lib/theme";
import { useAppColorScheme } from "@/lib/use-app-color-scheme";
import { cn } from "@/lib/utils";

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_SNAP_POINTS: Array<string | number> = ["50%"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Composes multiple press handlers into one.
 * Handlers are called in order; individual failures don't block others.
 */
function composePressHandlers(
	...handlers: Array<PressableProps["onPress"] | undefined>
): PressableProps["onPress"] {
	return (event) => {
		for (const handler of handlers) {
			handler?.(event);
		}
	};
}

// ─── Backdrop ────────────────────────────────────────────────────────────────

const SheetBackdrop = React.memo(function SheetBackdrop(
	props: React.ComponentProps<typeof BottomSheetBackdrop> & {
		panDownToClose?: boolean;
	},
) {
	const { panDownToClose, ...backdropProps } = props;
	const pressBehavior = panDownToClose ? "close" : "none";

	return (
		<BottomSheetBackdrop
			{...backdropProps}
			appearsOnIndex={0}
			disappearsOnIndex={-1}
			pressBehavior={pressBehavior}
		/>
	);
});

// ─── Context ─────────────────────────────────────────────────────────────────

// Stable ref context — never read .current during render
type SheetRefContextValue = {
	modalRef: React.RefObject<BottomSheetModal | null>;
};

// Callbacks + config context — safe for render
type SheetStateContextValue = {
	closeOnSelect: boolean;
	openSheet: () => void;
	closeSheet: () => void;
};

const SheetRefContext = React.createContext<SheetRefContextValue | null>(null);
const SheetStateContext = React.createContext<SheetStateContextValue | null>(
	null,
);

function useSheetRef() {
	const ctx = React.useContext(SheetRefContext);
	if (!ctx) throw new Error("Sheet components must be used within <Sheet>.");
	return ctx;
}

function useOptionalSheetState() {
	return React.useContext(SheetStateContext);
}

function useSheetState() {
	const ctx = React.useContext(SheetStateContext);
	if (!ctx) throw new Error("Sheet components must be used within <Sheet>.");
	return ctx;
}

// ─── Sheet (Root) ─────────────────────────────────────────────────────────────

type SheetProps = React.PropsWithChildren<{
	defaultOpen?: boolean;
	closeOnSelect?: boolean;
}>;

function Sheet({
	children,
	defaultOpen = false,
	closeOnSelect = false,
}: SheetProps) {
	const modalRef = React.useRef<BottomSheetModal>(null);

	const openSheet = React.useCallback(() => {
		modalRef.current?.present();
	}, []);

	// dismiss() desmonta o modal e dispara onDismiss.
	// close() apenas anima para o snap point anterior — não use para fechar de verdade.
	const closeSheet = React.useCallback(() => {
		modalRef.current?.dismiss();
	}, []);

	React.useEffect(() => {
		if (defaultOpen) {
			modalRef.current?.present();
		}
	}, [defaultOpen]);

	// Separate memos: ref object is stable, state/callbacks are separate
	const refValue = React.useMemo(() => ({ modalRef }), []);
	const stateValue = React.useMemo(
		() => ({ closeOnSelect, openSheet, closeSheet }),
		[closeOnSelect, openSheet, closeSheet],
	);

	return (
		<SheetRefContext.Provider value={refValue}>
			<SheetStateContext.Provider value={stateValue}>
				{children}
			</SheetStateContext.Provider>
		</SheetRefContext.Provider>
	);
}

// ─── SheetTrigger ─────────────────────────────────────────────────────────────

type SheetTriggerProps = React.PropsWithChildren<{
	asChild?: boolean;
	disabled?: boolean;
	onPress?: PressableProps["onPress"];
}>;

function SheetTrigger({
	asChild = false,
	children,
	disabled,
	onPress,
}: SheetTriggerProps) {
	const { openSheet } = useSheetState();

	// Delega o controle de disabled ao Pressable nativo.
	// Não precisamos de um handler intermediário só para checar disabled.
	const handlePress = React.useMemo(
		() => composePressHandlers(onPress, openSheet),
		[onPress, openSheet],
	);

	if (asChild) {
		const child = React.Children.only(children) as React.ReactElement<{
			onPress?: PressableProps["onPress"];
			disabled?: boolean;
		}>;

		return React.cloneElement(child, {
			onPress: composePressHandlers(child.props.onPress, handlePress),
			disabled: child.props.disabled ?? disabled,
		});
	}

	return (
		<Pressable
			accessibilityRole="button"
			disabled={disabled}
			onPress={handlePress}
		>
			{children}
		</Pressable>
	);
}

// ─── SheetContent ─────────────────────────────────────────────────────────────

type SheetContentProps = React.PropsWithChildren<{
	snapPoints?: Array<string | number>;
	index?: number;
	panDownToClose?: boolean;
	enableDynamicSizing?: boolean;
	wrapWithView?: boolean;
	onDismiss?: () => void;
	onChange?: (index: number) => void;
}> &
	React.ComponentPropsWithoutRef<typeof BottomSheetView>;

function SheetContent({
	children,
	snapPoints,
	index = 0,
	panDownToClose = false,
	enableDynamicSizing = false,
	wrapWithView = true,
	onDismiss,
	onChange,
	className,
	style,
	...props
}: SheetContentProps) {
	const colorScheme = useAppColorScheme();

	// useSheetState() funciona aqui pois SheetContent ainda está fora do portal.
	// O contextValue é então re-provido DENTRO do portal via Provider aninhado,
	// garantindo que SheetClose e SheetItem consigam acessar o contexto.
	const { modalRef } = useSheetRef(); // ref comes from its own context
	const stateValue = useSheetState(); // callbacks + config separate

	const content = wrapWithView ? (
		<BottomSheetView className={className} style={style} {...props}>
			{children}
		</BottomSheetView>
	) : (
		children
	);

	return (
		<BottomSheetModal
			ref={modalRef}
			index={index}
			onChange={onChange}
			snapPoints={
				enableDynamicSizing
					? undefined
					: (snapPoints ?? DEFAULT_SNAP_POINTS)
			}
			enablePanDownToClose={panDownToClose}
			enableDynamicSizing={enableDynamicSizing}
			backdropComponent={(backdropProps) => (
				<SheetBackdrop
					{...backdropProps}
					panDownToClose={panDownToClose}
				/>
			)}
			onDismiss={onDismiss}
			backgroundStyle={{ backgroundColor: THEME[colorScheme].card }}
			handleIndicatorStyle={{
				backgroundColor: THEME[colorScheme].muted,
			}}
		>
			{/*
			 * Re-provê o contexto dentro do portal do BottomSheetModal.
			 * O portal quebra a árvore de contexto React, fazendo com que
			 * useContext() retorne null para componentes filhos como SheetClose.
			 * Envolver o conteúdo com o Provider corrige isso sem custo adicional.
			 */}
			<SheetRefContext.Provider value={{ modalRef }}>
				<SheetStateContext.Provider value={stateValue}>
					{content}
				</SheetStateContext.Provider>
			</SheetRefContext.Provider>
		</BottomSheetModal>
	);
}

// ─── SheetHeader / SheetFooter ────────────────────────────────────────────────

function SheetHeader({ className, ...props }: ViewProps) {
	return <View className={cn("gap-1.5 px-4 pt-1", className)} {...props} />;
}

function SheetFooter({ className, ...props }: ViewProps) {
	return (
		<View className={cn("gap-3 px-4 pb-4 pt-2", className)} {...props} />
	);
}

// ─── SheetTitle / SheetDescription ───────────────────────────────────────────

function SheetTitle({
	className,
	...props
}: React.ComponentProps<typeof Text>) {
	return (
		<Text
			variant="h4"
			className={cn("text-foreground text-left", className)}
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
			className={cn("text-muted-foreground text-sm text-left", className)}
			{...props}
		/>
	);
}

// ─── SheetItem ────────────────────────────────────────────────────────────────

const sheetItemVariants = cva(
	"flex-row items-center justify-between px-4 h-[56px] active:bg-primary/10",
	{
		variants: {
			selected: {
				true: "bg-primary android:active:bg-primary",
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
	closeOnSelect?: boolean;
	onPress?: () => void;
	className?: string;
};

const SheetItem = React.memo(function SheetItem({
	label,
	selected = false,
	disabled = false,
	closeOnSelect,
	onPress,
	className,
}: SheetItemProps) {
	const sheetState = useOptionalSheetState();
	const shouldCloseOnSelect =
		closeOnSelect ?? sheetState?.closeOnSelect ?? false;

	const handlePress = React.useCallback(() => {
		onPress?.();

		if (shouldCloseOnSelect) {
			sheetState?.closeSheet();
		}
	}, [onPress, sheetState, shouldCloseOnSelect]);

	return (
		<Pressable
			android_ripple={{ color: "rgba(0, 0, 0, 0.25)" }}
			accessibilityRole="button"
			accessibilityState={{ selected, disabled }}
			disabled={disabled}
			onPress={handlePress}
			className={cn(sheetItemVariants({ selected, disabled }), className)}
		>
			<Text className={cn("text-base", selected && "text-white")}>
				{label}
			</Text>

			<CheckIcon size={18} color={selected ? "white" : "transparent"} />
		</Pressable>
	);
});

// ─── SheetClose ───────────────────────────────────────────────────────────────

type SheetCloseProps = React.PropsWithChildren<{
	asChild?: boolean;
}>;

function SheetClose({ asChild = false, children }: SheetCloseProps) {
	const sheetState = useOptionalSheetState();
	const closeSheet = sheetState?.closeSheet;

	if (asChild) {
		const child = React.Children.only(children) as React.ReactElement<{
			onPress?: PressableProps["onPress"];
		}>;

		return React.cloneElement(child, {
			onPress: composePressHandlers(child.props.onPress, closeSheet),
		});
	}

	return <Pressable onPress={closeSheet}>{children}</Pressable>;
}

// ─── Exports ──────────────────────────────────────────────────────────────────

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
