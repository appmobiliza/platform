import { memo } from "react";

import { View } from "react-native";

import { Text } from "@/components/ui/text";

import { cn } from "@/lib/utils";

import { FromMarker, ToMarker } from "@/assets/route";

interface AddressProps {
	className?: string;
	label: string;
	marker: "from" | "to";
	children?: React.ReactNode;
	size?: "sm" | "md" | "lg";
}

function Address({
	label: title,
	className,
	marker = "from",
	size = "md",
	children,
}: AddressProps) {
	return (
		<View className={cn("w-full flex-row items-center gap-4", className)}>
			<View
				className={cn("size-3 items-center justify-center", {
					"size-6": size === "md",
					"size-9": size === "lg",
				})}
			>
				{marker === "from" ? (
					<FromMarker width={24} />
				) : (
					<ToMarker width={24} />
				)}
			</View>
			<View className="min-w-0 flex-1 flex-row items-center justify-between gap-4">
				<Text
					className={
						"min-w-0 flex-1 text-lg font-normal leading-none text-foreground"
					}
					numberOfLines={1}
				>
					{title}
				</Text>
				{children}
			</View>
		</View>
	);
}

export type AddressRouteProps = {
	className?: string;
	shouldShowRoute?: boolean;
	from: {
		label: string;
		children?: React.ReactNode;
		className?: string;
	};
	to: {
		label: string;
		children?: React.ReactNode;
		className?: string;
	};
};

function AddressRoute({
	className,
	shouldShowRoute,
	from,
	to,
}: AddressRouteProps) {
	return (
		<View className={cn("w-full flex-col items-start gap-1", className)}>
			<Address
				label={from.label}
				marker="from"
				className={from.className}
				size="md"
			>
				{from.children}
			</Address>

			<View className="w-full flex-row items-center justify-start gap-4">
				{shouldShowRoute && (
					<View className="size-6 items-center justify-center">
						<View className="h-6 w-0.5 bg-primary" />
					</View>
				)}
				<View className="flex-1 h-px bg-border" />
			</View>

			<Address
				label={to.label}
				marker="to"
				className={to.className}
				size="md"
			>
				{to.children}
			</Address>
		</View>
	);
}

export const MemoizedAddress = memo(Address);
export const MemoizedAddressRoute = memo(AddressRoute);

export { MemoizedAddress as Address, MemoizedAddressRoute as AddressRoute };
