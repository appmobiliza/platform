import type * as React from "react";

import {
	BottomSheetBackdrop,
	BottomSheetModal,
	BottomSheetScrollView,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import { View } from "react-native";

import { THEME, useThemeVariables } from "@/lib/theme";
import { cn } from "@/lib/utils";

import { SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "../ui/sheet";
import type { Stage } from "./types";
import { VariableContextProvider } from "nativewind";

function PortalThemeProvider({ children }: { children: React.ReactNode }) {
  const variables = useThemeVariables();
  return (
    <VariableContextProvider value={variables}>
      {children}
    </VariableContextProvider>
  );
}


interface SheetFrameProps {
	title: string;
	description?: string;
	headerPosition?: "start" | "center";
	accessory?: React.ReactNode;
	children: React.ReactNode;
	footer: React.ReactNode;
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
		<BottomSheetView className="flex-1">
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
			<View className="gap-4 px-4 pb-4 pt-4">
				{children}
			</View>
			<SheetFooter className="gap-3 border-t border-border px-4 pb-4 pt-3">
				{footer}
			</SheetFooter>
		</BottomSheetView>
	);
}

interface StageSheetProps {
	stage: Stage;
	modalRef: React.RefObject<BottomSheetModal | null>;
	onDismiss: (stage: Stage) => void;
	panDownToClose?: boolean;
	children: React.ReactNode;
	colorScheme: "light" | "dark";
}

function StageSheet({
	stage,
	modalRef,
	onDismiss,
	panDownToClose = false,
	children,
	colorScheme,
}: StageSheetProps) {
	return (
		<BottomSheetModal
			ref={modalRef}
			index={0}
			backdropComponent={(props) => (
				<BottomSheetBackdrop
					{...props}
					appearsOnIndex={0}
					disappearsOnIndex={-1}
					style={[props.style, { backgroundColor: "rgba(0,0,0,0.5)" }]}
				/>
			)}
			snapPoints={["90%"]}
			enableDynamicSizing={false}
			enablePanDownToClose={panDownToClose}
			onDismiss={() => onDismiss(stage)}
			backgroundStyle={{ backgroundColor: "red" }}
			handleIndicatorStyle={{
				backgroundColor: "red",
			}}
		>
			<BottomSheetView>
				<PortalThemeProvider>
					{children}
				</PortalThemeProvider>
			</BottomSheetView>
		</BottomSheetModal>
	);
}

export { SheetFrame, StageSheet };
