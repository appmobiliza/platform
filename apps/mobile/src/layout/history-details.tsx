import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";

import { AddressRoute, type AddressRouteProps } from "@/components/address";
import { Header } from "@/components/header";
import MapView from "@/components/map/map-view";
import { Text } from "@/components/ui/text";

import { cn } from "@/lib/utils";

type HistoryDetailLayoutProps = {
	title: string;
	subtitle: string;
	/** Optional coordinates to render the route on the map */
	mapOrigin?: { latitude: number; longitude: number } | null;
	mapDestination?: { latitude: number; longitude: number } | null;
	mapBadges?: ReactNode;
	profile?: ReactNode;
	route: AddressRouteProps;
	children?: ReactNode;
	contentClassName?: string;
};

export function HistoryDetailLayout({
	title,
	subtitle,
	mapOrigin,
	mapDestination,
	mapBadges,
	profile,
	route,
	children,
	contentClassName,
}: HistoryDetailLayoutProps) {
	const hasMap = !!mapOrigin && !!mapDestination;
	const routePath: Array<[number, number]> | undefined = hasMap
		? [
				[mapOrigin!.longitude, mapOrigin!.latitude],
				[mapDestination!.longitude, mapDestination!.latitude],
			]
		: undefined;

	return (
		<View className="flex-1 gap-4">
			<Header title="Informações" />

			<ScrollView
				className="flex-1"
				contentContainerClassName={cn("px-4 gap-4", contentClassName)}
				showsVerticalScrollIndicator={false}
			>
				<View className="h-48 w-full rounded-md overflow-hidden">
					{hasMap ? (
						<MapView
							routePath={routePath}
							interactive={false}
							initialViewState={{
								latitude:
									(mapOrigin!.latitude +
										mapDestination!.latitude) /
									2,
								longitude:
									(mapOrigin!.longitude +
										mapDestination!.longitude) /
									2,
								zoom: 15,
							}}
						/>
					) : (
						<View className="flex-1 bg-card" />
					)}
					{mapBadges ? (
						<View className="absolute inset-0 flex-row items-end justify-end p-4">
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

				<View className="w-full h-64 bg-transparent" />
			</ScrollView>
		</View>
	);
}
