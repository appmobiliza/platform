import type * as React from "react";

import {
	BottomSheetBackdrop,
	BottomSheetModal,
	BottomSheetScrollView,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import { View } from "react-native";

import { THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";

import { SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "../ui/sheet";
import type { Stage } from "./types";

interface SheetFrameProps {
	title: string;
	description?: string;
	headerPosition?: "start" | "center";
	accessory?: React.ReactNode;
	children: React.ReactNode;
	footer: React.ReactNode;
	hasList?: boolean;
}

function SheetFrame({
	title,
	description,
	accessory,
	headerPosition = "start",
	children,
	footer,
}: SheetFrameProps) {
	return (
		<>
			<SheetHeader
				className={cn("border-b border-border py-4 gap-1 items-start", {
					"items-center": headerPosition === "center",
				})}
			>
				<View
					className={cn(
						"flex-row items-center justify-start w-full gap-2",
						{
							"justify-between": !!accessory,
							"justify-center": headerPosition === "center",
						},
					)}
				>
					<SheetTitle>{title}</SheetTitle>
					{accessory ? accessory : null}
				</View>
				{description ? <SheetDescription>{description}</SheetDescription> : null}
			</SheetHeader>
			{children}
			<SheetFooter className="gap-3 border-t border-border px-4 pb-6 pt-3">
				{footer}
			</SheetFooter>
		</>
	)
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

	return (
		<BottomSheetModal
			ref={modalRef}
			index={0}
			enableDynamicSizing={snapPoints?.length === 0}
			snapPoints={snapPoints?.length > 0 ? snapPoints : undefined}
			enablePanDownToClose={panDownToClose}
			onDismiss={() => onDismiss(stage)}
			backgroundStyle={{ backgroundColor: THEME[colorScheme].card }}
			handleIndicatorStyle={{
				backgroundColor: THEME[colorScheme].muted,
			}}
		>
			{children}
		</BottomSheetModal>
	);
}

export { SheetFrame, StageSheet };
