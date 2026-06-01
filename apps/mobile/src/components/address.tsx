import { memo } from "react";

import { View } from "react-native";

import { Text } from "@/components/ui/text";

import { cn } from "@/lib/utils";

import { FromMarker, ToMarker } from "@/assets/route";

interface AddressProps {
	className?: string;
	label: string;
	description?: string;
	marker: "from" | "to";
	children?: React.ReactNode;
	size?: "sm" | "md" | "lg";
}

function Address({
	label,
	description,
	className,
	marker = "from",
	size = "md",
	children,
}: AddressProps) {
	const sizePx = size === "sm" ? 12 : size === "md" ? 24 : 36;

	return (
		<View className={cn("w-full flex-row items-center gap-4", className)}>
			<View
				className={cn("size-6 items-center justify-center", {
					"size-3": size === "sm",
					"size-9": size === "lg",
				})}
			>
				{marker === "from" ? (
					<FromMarker width={sizePx} />
				) : (
					<ToMarker width={sizePx} />
				)}
			</View>
			<View className="min-w-0 flex-1 flex-row items-center justify-between gap-4">
				<View className="flex-1 flex-col items-start">
					<Text
						className={
							"min-w-0 flex-1 text-lg font-normal leading-none text-foreground"
						}
						numberOfLines={1}
					>
						{label}
					</Text>
					{description && (
						<Text
							className={
								"min-w-0 flex-1 text-sm font-normal leading-none text-muted-foreground mt-1"
							}
							numberOfLines={1}
						>
							{description}
						</Text>
					)}
				</View>
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
		description?: string;
		children?: React.ReactNode;
		className?: string;
	};
	to: {
		label: string;
		description?: string;
		children?: React.ReactNode;
		className?: string;
	};
	size?: AddressProps["size"];
};

function AddressRoute({
	className,
	shouldShowRoute,
	from,
	to,
	size,
}: AddressRouteProps) {
	return (
		<View className={cn("w-full flex-col items-start gap-1", className)}>
			<Address
				label={from.label}
				description={from.description}
				marker="from"
				className={from.className}
				size={size}
			>
				{from.children}
			</Address>

			<View className="w-full flex-row items-center justify-start gap-4">
				{shouldShowRoute && (
					<View
						className={cn("size-6 items-center justify-center", {
							"size-9": size === "lg",
							"size-3": size === "sm",
						})}
					>
						<View className="h-6 w-0.5 bg-primary" />
					</View>
				)}
				<View className="flex-1 h-px bg-foreground/50" />
			</View>

			<Address
				label={to.label}
				description={to.description}
				marker="to"
				className={to.className}
				size={size}
			>
				{to.children}
			</Address>
		</View>
	);
}

export const MemoizedAddress = memo(Address);
export const MemoizedAddressRoute = memo(AddressRoute);

export { MemoizedAddress as Address, MemoizedAddressRoute as AddressRoute };
