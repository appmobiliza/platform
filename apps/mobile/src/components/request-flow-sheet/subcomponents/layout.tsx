import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import type * as React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";

import { THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";

import type { Stage } from "../types";

interface SheetFrameProps {
	title: string;
	description?: string;
	headerPosition?: "start" | "center";
	accessory?: React.ReactNode;
	children: React.ReactNode;
	footer?: React.ReactNode;
	shouldWrapChildren?: boolean;
}

function SheetFrame({
	title,
	description,
	accessory,
	headerPosition = "start",
	children,
	footer,
	shouldWrapChildren = false,
}: SheetFrameProps) {
	return (
		<>
			<SheetHeader
				className={cn(
					"border-b border-border py-4 gap-4 items-start justify-start flex-row",
					{
						"items-center": headerPosition === "center",
					},
				)}
			>
				<View
					className={cn(
						"flex-col items-start justify-start flex-1 gap-1",
						{
							"items-center": headerPosition === "center",
						},
					)}
				>
					<SheetTitle>{title}</SheetTitle>
					{description ? (
						<SheetDescription>{description}</SheetDescription>
					) : null}
				</View>
				{accessory ? accessory : null}
			</SheetHeader>
			{shouldWrapChildren ? (
				<View className="p-4 gap-4">{children}</View>
			) : (
				children
			)}
			{footer && (
				<SheetFooter className="gap-3 border-t border-border px-4 pb-6 pt-3">
					{footer}
				</SheetFooter>
			)}
		</>
	);
}

interface StageSheetProps {
	stage: Stage;
	modalRef: React.RefObject<BottomSheetModal | null>;
	onDismiss: (stage: Stage) => void;
	panDownToClose?: boolean;
	snapPoints?: string[];
	children: React.ReactNode;
	colorScheme: "light" | "dark";
}

function StageSheet({
	stage,
	modalRef,
	onDismiss,
	panDownToClose = false,
	snapPoints = [],
	children,
	colorScheme,
}: StageSheetProps) {
	const insets = useSafeAreaInsets();
	const isDynamic = snapPoints.length === 0;

	return (
		<BottomSheetModal
			ref={modalRef}
			index={0}
			enableDynamicSizing={isDynamic}
			snapPoints={isDynamic ? undefined : snapPoints}
			enablePanDownToClose={panDownToClose}
			onDismiss={() => onDismiss(stage)}
			backgroundStyle={{ backgroundColor: THEME[colorScheme].card }}
			handleIndicatorStyle={{
				backgroundColor: THEME[colorScheme].muted,
			}}
			style={{
				paddingBottom: insets.bottom,
			}}
		>
			{isDynamic ? (
				<BottomSheetView>{children}</BottomSheetView>
			) : (
				children
			)}
		</BottomSheetModal>
	);
}

export { SheetFrame, StageSheet };
