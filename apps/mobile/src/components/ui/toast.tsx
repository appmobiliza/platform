import {
	AlertTriangle,
	CheckCircle2,
	Info,
	X,
	XCircle,
} from "lucide-react-native";
import * as React from "react";
import { ActivityIndicator, Platform, Pressable, View } from "react-native";
import {
	FadeIn,
	FadeOut,
	SlideInDown,
	SlideOutDown,
} from "react-native-reanimated";
import { FullWindowOverlay as RNFullWindowOverlay } from "react-native-screens";

import {
	Dialog,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { NativeOnlyAnimatedView } from "@/components/ui/native-only-animated-view";

import { cn } from "@/lib/utils";

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

type ToastVariant =
	| "default"
	| "success"
	| "error"
	| "warning"
	| "info"
	| "loading";

interface ToastAction {
	label: string;
	onClick: (event: { preventDefault: () => void }) => void;
}

interface ToastOptions {
	description?: string;
	variant?: ToastVariant;
	duration?: number;
	icon?: React.ReactNode;
	action?: ToastAction | React.ReactNode;
	cancel?: ToastAction | React.ReactNode;
	id?: string;
	onDismiss?: (id: string) => void;
	onAutoClose?: (id: string) => void;
	dismissible?: boolean;
	closeButton?: boolean;
}

interface ToastData {
	id: string;
	variant: ToastVariant;
	title: string;
	description?: string;
	duration: number;
	icon?: React.ReactNode;
	action?: ToastAction | React.ReactNode;
	cancel?: ToastAction | React.ReactNode;
	onDismiss?: (id: string) => void;
	onAutoClose?: (id: string) => void;
	dismissible: boolean;
	closeButton: boolean;
	createdAt: number;
}

// ────────────────────────────────────────────────────────────────
// Store
// ────────────────────────────────────────────────────────────────

let toasts: ToastData[] = [];
const listeners = new Set<() => void>();

function subscribe(fn: () => void) {
	listeners.add(fn);
	return () => {
		listeners.delete(fn);
	};
}

function getState(): ToastData[] {
	return toasts;
}

function addToast(t: ToastData) {
	toasts = [...toasts.filter((item) => item.id !== t.id), t];
	listeners.forEach((fn) => {
		fn();
	});
}

function dismissToast(id?: string) {
	if (!id) {
		toasts = [];
	} else {
		toasts = toasts.filter((t) => t.id !== id);
	}
	listeners.forEach((fn) => {
		fn();
	});
}

// ────────────────────────────────────────────────────────────────
// toast() API
// ────────────────────────────────────────────────────────────────

let count = 0;
function generateId() {
	return `toast-${++count}-${Date.now()}`;
}

function isToastAction(
	value: ToastAction | React.ReactNode | undefined,
): value is ToastAction {
	return (
		typeof value === "object" &&
		value !== null &&
		"label" in value &&
		"onClick" in value
	);
}

function toast(message: string, options?: ToastOptions): string {
	const id = options?.id ?? generateId();
	const t: ToastData = {
		id,
		variant: options?.variant ?? "default",
		title: message,
		description: options?.description,
		duration: options?.duration ?? 4000,
		icon: options?.icon,
		action: options?.action,
		cancel: options?.cancel,
		onDismiss: options?.onDismiss,
		onAutoClose: options?.onAutoClose,
		dismissible: options?.dismissible ?? true,
		closeButton: options?.closeButton ?? false,
		createdAt: Date.now(),
	};
	addToast(t);
	return id;
}

toast.success = (message: string, options?: ToastOptions): string => {
	return toast(message, {
		...options,
		variant: "success",
	});
};

toast.error = (message: string, options?: ToastOptions): string => {
	return toast(message, {
		...options,
		variant: "error",
	});
};

toast.warning = (message: string, options?: ToastOptions): string => {
	return toast(message, {
		...options,
		variant: "warning",
	});
};

toast.info = (message: string, options?: ToastOptions): string => {
	return toast(message, {
		...options,
		variant: "info",
	});
};

toast.loading = (message: string, options?: ToastOptions): string => {
	return toast(message, {
		...options,
		variant: "loading",
		duration: Infinity,
		dismissible: false,
		closeButton: false,
	});
};

toast.dismiss = dismissToast;

toast.promise = <T,>(
	promise: Promise<T>,
	options: {
		loading: string;
		success: (data: T) => string;
		error: (err: unknown) => string;
	},
): string => {
	const id = generateId();
	toast.loading(options.loading, { id });

	promise
		.then((data) => {
			toast.success(options.success(data), { id });
		})
		.catch((err) => {
			toast.error(options.error(err), { id });
		});

	return id;
};

export { toast };

// ────────────────────────────────────────────────────────────────
// FullWindowOverlay
// ────────────────────────────────────────────────────────────────

const FullWindowOverlay =
	Platform.OS === "ios" ? RNFullWindowOverlay : React.Fragment;

// ────────────────────────────────────────────────────────────────
// DialogToast
// ────────────────────────────────────────────────────────────────

function DialogToast({ data }: { data: ToastData }) {
	// Auto-dismiss timer
	const timerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	);

	React.useEffect(() => {
		if (data.duration === Infinity) return;

		timerRef.current = setTimeout(() => {
			data.onAutoClose?.(data.id);
			dismissToast(data.id);
		}, data.duration);

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [data.id, data.duration, data.onAutoClose]);

	const handleDismiss = React.useCallback(() => {
		data.onDismiss?.(data.id);
		dismissToast(data.id);
	}, [data.id, data.onDismiss]);

	// ── Variant configuration ────────────────────────────────────
	const variantConfig = (() => {
		switch (data.variant) {
			case "success":
				return {
					icon: CheckCircle2,
					color: "--success",
					borderClass: "border-l-success-border",
				};
			case "error":
				return {
					icon: XCircle,
					color: "--destructive",
					borderClass: "border-l-destructive-border",
				};
			case "warning":
				return {
					icon: AlertTriangle,
					color: "--warning",
					borderClass: "border-l-warning-border",
				};
			case "info":
				return {
					icon: Info,
					color: "--info",
					borderClass: "border-l-info-border",
				};
			case "loading":
				return {
					icon: null,
					color: "--info",
					borderClass: "border-l-info-border",
				};
			default:
				return {
					icon: null,
					color: "transparent",
					borderClass: "",
				};
		}
	})();

	const content = (
		<Dialog
			open={true}
			onOpenChange={(open) => {
				if (!open) {
					// Delay to let the exit animation play (~150ms matches fade-out-0 duration)
					setTimeout(() => handleDismiss(), 150);
				}
			}}
		>
			<View
				className={cn(
					"bg-background border-border z-50 mx-auto flex w-full max-w-[calc(100%-2rem)] flex-col gap-4 rounded-lg border p-6 shadow-lg shadow-black/5 sm:max-w-lg",
					Platform.select({
						web: "animate-in fade-in-0 zoom-in-95 duration-200",
					}),
					data.variant !== "default" && "border-l-4",
					data.variant !== "default" && variantConfig.borderClass,
				)}
			>
				{/* Close button */}
				{data.dismissible && data.closeButton && (
					<Pressable
						onPress={handleDismiss}
						hitSlop={12}
						className={cn(
							"absolute right-4 top-4 rounded opacity-70 active:opacity-100",
							Platform.select({
								web: "transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
							}),
						)}
					>
						<Icon icon={X} size={16} color="--accent-foreground" />
					</Pressable>
				)}

				<DialogHeader>
					<View className="flex-row items-start gap-3">
						{data.variant === "loading" ? (
							<ActivityIndicator size={20} />
						) : data.icon ? (
							data.icon
						) : variantConfig.icon ? (
							<Icon
								icon={variantConfig.icon}
								size={20}
								color={variantConfig.color}
							/>
						) : null}
						<View className="flex-1">
							<DialogTitle>{data.title}</DialogTitle>
							{data.description && (
								<DialogDescription>
									{data.description}
								</DialogDescription>
							)}
						</View>
					</View>
				</DialogHeader>

				{/* Actions */}
				{(data.action || data.cancel) && (
					<DialogFooter>
						{isToastAction(data.cancel) && (
							<Pressable
								onPress={() => {
									const c = data.cancel as ToastAction;
									c.onClick({
										preventDefault: () => {},
									});
									handleDismiss();
								}}
								className={cn(
									"flex-row items-center justify-center rounded-md px-4 py-2 active:bg-accent",
									Platform.select({
										web: "transition-colors hover:bg-accent",
									}),
								)}
							>
								<span className="text-foreground text-base font-medium">
									{data.cancel.label}
								</span>
							</Pressable>
						)}
						{!isToastAction(data.cancel) && data.cancel}
						{isToastAction(data.action) && (
							<Pressable
								onPress={() => {
									const a = data.action as ToastAction;
									a.onClick({
										preventDefault: () => {},
									});
									handleDismiss();
								}}
								className={cn(
									"bg-primary flex-row items-center justify-center rounded-md px-4 py-2 shadow-sm shadow-black/5 active:bg-primary/90",
									Platform.select({
										web: "transition-colors hover:bg-primary/90",
									}),
								)}
							>
								<span className="text-primary-foreground text-base font-medium">
									{data.action.label}
								</span>
							</Pressable>
						)}
						{!isToastAction(data.action) && data.action}
					</DialogFooter>
				)}
			</View>
		</Dialog>
	);

	// ── Native: FullWindowOverlay + Reanimated animations ──────
	if (Platform.OS !== "web") {
		return (
			<FullWindowOverlay>
				{/* Backdrop */}
				<Pressable
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
					}}
					onPress={data.dismissible ? handleDismiss : undefined}
				>
					<NativeOnlyAnimatedView
						entering={FadeIn.duration(200)}
						exiting={FadeOut.duration(150)}
						style={{
							flex: 1,
							backgroundColor: "rgba(0, 0, 0, 0.5)",
						}}
					/>
				</Pressable>

				{/* Content */}
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
						style={{ width: "100%", alignItems: "center" }}
					>
						{content}
					</NativeOnlyAnimatedView>
				</View>
			</FullWindowOverlay>
		);
	}

	// ── Web: CSS animations via NativeWind ──────────────────────
	return (
		<View
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				zIndex: 9999,
			}}
			pointerEvents="box-none"
		>
			{/* Backdrop */}
			<Pressable
				onPress={data.dismissible ? handleDismiss : undefined}
				className="animate-in fade-in-0 fixed bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-black/50 p-2 duration-200"
			>
				{/* We place content inside here so the backdrop click-away works */}
				<Pressable
					onPress={(e) => e.stopPropagation()}
					className="w-full max-w-lg animate-in fade-in-0 zoom-in-95 duration-200"
				>
					{content}
				</Pressable>
			</Pressable>
		</View>
	);
}

// ────────────────────────────────────────────────────────────────
// Toaster
// ────────────────────────────────────────────────────────────────

function Toaster() {
	const [state, setState] = React.useState<ToastData[]>([]);

	React.useEffect(() => {
		const unsub = subscribe(() => {
			setState([...getState()]);
		});
		return unsub;
	}, []);

	if (state.length === 0) return null;

	return (
		<>
			{/* Render each toast as a stacked dialog overlay.
				Only the rearmost backdrop actually dims the screen;
				overlapping backdrops from multiple toasts would
				compound, so we render them stacked but the Toaster
				container itself provides the backdrop. */}
			{state.map((t) => (
				<DialogToast key={t.id} data={t} />
			))}
		</>
	);
}

export { Toaster };
