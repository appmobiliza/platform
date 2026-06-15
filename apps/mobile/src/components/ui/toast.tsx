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

import { Icon } from "@/components/ui/icon";
import { NativeOnlyAnimatedView } from "@/components/ui/native-only-animated-view";
import { Text } from "@/components/ui/text";

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
	description?: React.ReactNode;
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
	description?: React.ReactNode;
	duration: number;
	icon?: React.ReactNode;
	action?: ToastAction | React.ReactNode;
	cancel?: ToastAction | React.ReactNode;
	onDismiss?: (id: string) => void;
	onAutoClose?: (id: string) => void;
	dismissible: boolean;
	closeButton: boolean;
}

// ────────────────────────────────────────────────────────────────
// Store
// ────────────────────────────────────────────────────────────────

let toasts: ToastData[] = [];
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
	listeners.add(cb);
	return () => {
		listeners.delete(cb);
	};
}

function getSnapshot(): ToastData[] {
	return toasts;
}

function emitChange() {
	listeners.forEach((cb) => {
		cb();
	});
}

function addToast(t: ToastData) {
	toasts = [...toasts.filter((item) => item.id !== t.id), t];
	emitChange();
}

function dismissToast(id?: string) {
	if (!id) {
		toasts = [];
	} else {
		toasts = toasts.filter((t) => t.id !== id);
	}
	emitChange();
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
		duration: options?.duration ?? Infinity,
		icon: options?.icon,
		action: options?.action,
		cancel: options?.cancel,
		onDismiss: options?.onDismiss,
		onAutoClose: options?.onAutoClose,
		dismissible: options?.dismissible ?? true,
		closeButton: options?.closeButton ?? true,
	};
	addToast(t);
	return id;
}

toast.success = (message: string, options?: ToastOptions): string => {
	return toast(message, { ...options, variant: "success" });
};

toast.error = (message: string, options?: ToastOptions): string => {
	return toast(message, { ...options, variant: "error" });
};

toast.warning = (message: string, options?: ToastOptions): string => {
	return toast(message, { ...options, variant: "warning" });
};

toast.info = (message: string, options?: ToastOptions): string => {
	return toast(message, { ...options, variant: "info" });
};

toast.loading = (message: string, options?: ToastOptions): string => {
	return toast(message, {
		...options,
		variant: "loading",
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
// Variant visual config
// ────────────────────────────────────────────────────────────────

const VARIANT_CONFIG = {
	success: {
		icon: CheckCircle2,
		color: "--success",
		borderClass: "border-l-success-border",
	},
	error: {
		icon: XCircle,
		color: "--destructive",
		borderClass: "border-l-destructive-border",
	},
	warning: {
		icon: AlertTriangle,
		color: "--warning",
		borderClass: "border-l-warning-border",
	},
	info: {
		icon: Info,
		color: "--info",
		borderClass: "border-l-info-border",
	},
	loading: {
		icon: null,
		color: "--info",
		borderClass: "border-l-info-border",
	},
	default: {
		icon: null,
		color: "transparent",
		borderClass: "",
	},
} as const;

// ────────────────────────────────────────────────────────────────
// FullWindowOverlay
// ────────────────────────────────────────────────────────────────

const FullWindowOverlay =
	Platform.OS === "ios" ? RNFullWindowOverlay : React.Fragment;

// ────────────────────────────────────────────────────────────────
// ToastItem — renders a single toast with enter/exit animations
// ────────────────────────────────────────────────────────────────

const EXIT_ANIMATION_DURATION = 300;

function ToastItem({ data }: { data: ToastData }) {
	const [leaving, setLeaving] = React.useState(false);
	const leavingRef = React.useRef(false);

	// On web only — tracks first render for enter transition
	const [mounted, setMounted] = React.useState(
		Platform.OS === "web" ? false : true,
	);

	React.useEffect(() => {
		if (Platform.OS !== "web") return;
		const raf = requestAnimationFrame(() => setMounted(true));
		return () => cancelAnimationFrame(raf);
	}, []);

	const handleDismiss = React.useCallback(() => {
		if (leavingRef.current) return;
		leavingRef.current = true;
		setLeaving(true);

		setTimeout(() => {
			data.onDismiss?.(data.id);
			dismissToast(data.id);
		}, EXIT_ANIMATION_DURATION);
	}, [data.id, data.onDismiss]);

	// Auto-dismiss timer
	const handleDismissRef = React.useRef(handleDismiss);
	handleDismissRef.current = handleDismiss;

	React.useEffect(() => {
		if (data.duration === Infinity) return;

		const timer = setTimeout(() => {
			data.onAutoClose?.(data.id);
			handleDismissRef.current();
		}, data.duration);

		return () => {
			clearTimeout(timer);
		};
	}, [data.id, data.duration, data.onAutoClose]);

	const config = VARIANT_CONFIG[data.variant];

	// ── Card content (shared between web & native) ──────────────
	const card = (
		<View
			className={cn(
				"bg-background border-border mx-auto flex w-full max-w-[calc(100%-2rem)] flex-col gap-4 rounded-lg border p-6 shadow-lg shadow-black/5 sm:max-w-lg",
				data.variant !== "default" && "border-l-4",
				data.variant !== "default" && config.borderClass,
			)}
		>
			{/* Close button */}
			{data.dismissible && data.closeButton && (
				<Pressable
					onPress={handleDismiss}
					hitSlop={12}
					accessibilityLabel="Fechar"
					accessibilityRole="button"
					className={cn(
						"absolute right-6 top-6.5 rounded opacity-70 active:opacity-100",
						Platform.select({
							web: "transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
						}),
					)}
				>
					<Icon icon={X} size={24} color="--foreground" />
				</Pressable>
			)}

			{/* Icon + heading */}
			<View className="flex-row items-start gap-3">
				<View className="mt-1">
					{data.variant === "loading" ? (
						<ActivityIndicator size={20} />
					) : data.icon ? (
						data.icon
					) : config.icon ? (
						<Icon
							icon={config.icon}
							size={20}
							color={config.color}
						/>
					) : null}
				</View>

				<View className="flex-1 gap-1">
					<Text className="text-foreground text-lg font-semibold leading-none">
						{data.title}
					</Text>
					{data.description &&
						(typeof data.description === "string" ? (
							<Text className="text-muted-foreground text-sm">
								{data.description}
							</Text>
						) : (
							<View className="text-muted-foreground text-sm">
								{data.description}
							</View>
						))}
				</View>
			</View>

			{/*<Button accessibilityRole="button" onPress={handleDismiss}>
				<Text>Fechar</Text>
			</Button>*/}

			{/* Actions */}
			{(data.action || data.cancel) && (
				<View className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
					{isToastAction(data.cancel) && (
						<Pressable
							onPress={() => {
								(data.cancel as ToastAction).onClick({
									preventDefault: () => {},
								});
								handleDismiss();
							}}
							accessibilityRole="button"
							className={cn(
								"flex-row items-center justify-center rounded-md px-4 py-2 active:bg-accent",
								Platform.select({
									web: "transition-colors hover:bg-accent",
								}),
							)}
						>
							<Text className="text-foreground text-base font-medium">
								{(data.cancel as ToastAction).label}
							</Text>
						</Pressable>
					)}
					{!isToastAction(data.cancel) && data.cancel}

					{isToastAction(data.action) && (
						<Pressable
							onPress={() => {
								(data.action as ToastAction).onClick({
									preventDefault: () => {},
								});
								handleDismiss();
							}}
							accessibilityRole="button"
							className={cn(
								"bg-primary flex-row items-center justify-center rounded-md px-4 py-2 shadow-sm shadow-black/5 active:bg-primary/90",
								Platform.select({
									web: "transition-colors hover:bg-primary/90",
								}),
							)}
						>
							<Text className="text-primary-foreground text-base font-medium">
								{(data.action as ToastAction).label}
							</Text>
						</Pressable>
					)}
					{!isToastAction(data.action) && data.action}
				</View>
			)}
		</View>
	);

	// ── Native: FullWindowOverlay + Reanimated ──────────────────
	if (Platform.OS !== "web") {
		return (
			<FullWindowOverlay>
				{/* Backdrop — unmounts to trigger FadeOut exit */}
				{!leaving && (
					<Pressable
						onPress={data.dismissible ? handleDismiss : undefined}
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
								backgroundColor: "rgba(0,0,0,0.5)",
							}}
						/>
					</Pressable>
				)}

				{/* Content — unmounts to trigger SlideOutDown exit */}
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
					{!leaving && (
						<NativeOnlyAnimatedView
							entering={SlideInDown.duration(300).springify()}
							exiting={SlideOutDown.duration(200)}
							style={{
								width: "100%",
								alignItems: "center",
							}}
						>
							{card}
						</NativeOnlyAnimatedView>
					)}
				</View>
			</FullWindowOverlay>
		);
	}

	// ── Web: CSS transitions (reliable for state-based animation) ─
	//
	// We use CSS transitions on opacity & transform instead of
	// tw-animate-css keyframe animations because transitions are
	// synchronised with React state changes — no "flash" on unmount.
	//
	// Enter:  mount → mounted={false} (hidden) → rAF → mounted={true} (visible)
	// Exit:   leaving={false} (visible) → dismiss → leaving={true} (hidden)
	// Cleanup: after EXIT_ANIMATION_DURATION the toast is removed from store.
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
				className={cn(
					"absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center p-2",
					"transition-all ease-in-out duration-200",
					leaving || !mounted
						? "bg-black/0 opacity-0"
						: "bg-black/50 opacity-100",
				)}
			>
				{/* Inner pressable stops propagation so taps on card don't dismiss */}
				<Pressable
					onPress={(e) => e.stopPropagation()}
					className={cn(
						"w-full max-w-lg",
						"transition-all ease-in-out duration-200",
						leaving || !mounted
							? "opacity-0 scale-95"
							: "opacity-100 scale-100",
					)}
				>
					{card}
				</Pressable>
			</Pressable>
		</View>
	);
}

// ────────────────────────────────────────────────────────────────
// Toaster
// ────────────────────────────────────────────────────────────────

function Toaster() {
	const state = React.useSyncExternalStore(
		subscribe,
		getSnapshot,
		getSnapshot,
	);

	if (state.length === 0) return null;

	return (
		<>
			{state.map((t) => (
				<ToastItem key={t.id} data={t} />
			))}
		</>
	);
}

export { Toaster };
