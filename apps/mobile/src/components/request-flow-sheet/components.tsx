import type * as React from "react";

import {
	BottomSheetBackdrop,
	BottomSheetModal,
	BottomSheetScrollView,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useColorScheme, View } from "react-native";

import { THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";

import { SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet";
import type { Stage } from "./types";

function SheetBackdrop(
	props: React.ComponentProps<typeof BottomSheetBackdrop>,
) {
	return (
		<BottomSheetBackdrop
			{...props}
			appearsOnIndex={0}
			disappearsOnIndex={-1}
			pressBehavior="close"
		/>
	);
}

function SheetFrame({
	title,
	subtitle,
	accessory,
	headerPosition = "start",
	children,
	footer,
}: {
	title: string;
	subtitle?: string;
	headerPosition?: "start" | "center";
	accessory?: React.ReactNode;
	children: React.ReactNode;
	footer: React.ReactNode;
}) {
	return (
		<View className="flex-1">
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
					{accessory}
				</View>
				<SheetDescription>{subtitle}</SheetDescription>
			</SheetHeader>
			<BottomSheetScrollView
				className="flex-1"
				contentContainerClassName="gap-4 px-4 pb-4 pt-4"
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				{children}
			</BottomSheetScrollView>
			<View className="gap-3 border-t border-border px-4 pb-4 pt-3">
				{footer}
			</View>
		</View>
	);
}

function StageSheet({
	stage,
	modalRef,
	onDismiss,
	enablePanDownToClose = false,
	children,
}: {
	stage: Stage;
	modalRef: React.RefObject<BottomSheetModal | null>;
	onDismiss: (stage: Stage) => void;
	enablePanDownToClose?: boolean;
	children: React.ReactNode;
}) {
	const colorScheme = useColorScheme();

	return (
		<BottomSheetModal
			ref={modalRef}
			index={0}
			// snapPoints={["94%"]}
			backdropComponent={SheetBackdrop}
			enableDynamicSizing={true}
			enablePanDownToClose={enablePanDownToClose}
			onDismiss={() => onDismiss(stage)}
			backgroundStyle={{ backgroundColor: THEME[colorScheme].card }}
			handleIndicatorStyle={{
				backgroundColor: THEME[colorScheme].muted,
			}}
		>
			<BottomSheetView className="flex-1">{children}</BottomSheetView>
		</BottomSheetModal>
	);
}

export { SheetBackdrop, SheetFrame, StageSheet };
