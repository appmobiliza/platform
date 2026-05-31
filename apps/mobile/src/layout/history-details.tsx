import type { ReactNode } from "react";

import { ScrollView, View } from "react-native";

import { AddressRoute, type AddressRouteProps } from "@/components/address";
import { Header } from "@/components/header";
import { Text } from "@/components/ui/text";

import { cn } from "@/lib/utils";

type HistoryDetailLayoutProps = {
	title: string;
	subtitle: string;
	mapBadges?: ReactNode;
	profile?: ReactNode;
	route: AddressRouteProps;
	children?: ReactNode;
	contentClassName?: string;
};

export function HistoryDetailLayout({
	title,
	subtitle,
	mapBadges,
	profile,
	route,
	children,
	contentClassName,
}: HistoryDetailLayoutProps) {
	return (
		<View className="flex-1 bg-background gap-4">
			<Header title="Informações" />

			<ScrollView
				className="flex-1"
				contentContainerClassName={cn("px-4 gap-4", contentClassName)}
				showsVerticalScrollIndicator={false}
			>
				<View className="h-48 w-full rounded-md bg-card items-end justify-end">
					{mapBadges ? (
						<View className="flex flex-row items-center justify-end gap-2 p-4">
							{mapBadges}
						</View>
					) : null}
				</View>

				<View className="gap-1">
					<Text className="font-bold text-2xl text-foreground">
						{title}
					</Text>
					<Text className="text-base text-muted-foreground">
						{subtitle}
					</Text>
				</View>

				{profile}

				<AddressRoute {...route} />

				{children}
			</ScrollView>
		</View>
	);
}
