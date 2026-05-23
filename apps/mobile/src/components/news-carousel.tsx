import { useCallback, useEffect, useRef } from "react";

import { Image } from "expo-image";
import { Linking, Pressable, useWindowDimensions, View } from "react-native";
import Animated, {
	Extrapolation,
	interpolate,
	type SharedValue,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue,
} from "react-native-reanimated";

import { Text } from "@/components/ui/text";

export type NewsItem = {
	image: string;
	label: string;
	link: string;
};

interface NewsCarouselProps {
	items: NewsItem[];
	autoScroll?: boolean;
	autoScrollIntervalMs?: number;
}

const HORIZONTAL_PADDING = 16;
const CARD_SPACING = 12;
const DEFAULT_AUTO_SCROLL_INTERVAL_MS = 4000;

export const NewsCarousel = ({
	items,
	autoScroll = false,
	autoScrollIntervalMs = DEFAULT_AUTO_SCROLL_INTERVAL_MS,
}: NewsCarouselProps) => {
	const { width } = useWindowDimensions();
	const cardWidth = Math.max(width - HORIZONTAL_PADDING * 2, 280);
	const scrollInterval = cardWidth + CARD_SPACING;
	const scrollX = useSharedValue(0);
	const flatListRef = useRef<Animated.FlatList<NewsItem>>(null);
	const currentIndexRef = useRef(0);

	const handleOpenLink = useCallback((link: string) => {
		Linking.openURL(link).catch((error) => {
			console.error("Failed to open news link:", error);
		});
	}, []);

	const scrollToIndex = useCallback(
		(index: number) => {
			flatListRef.current?.scrollToOffset({
				offset: index * scrollInterval,
				animated: true,
			});
		},
		[scrollInterval],
	);

	const onScroll = useAnimatedScrollHandler({
		onScroll: (event) => {
			scrollX.value = event.contentOffset.x;
		},
	});

	useEffect(() => {
		if (!autoScroll || items.length < 2) {
			return;
		}

		const intervalId = setInterval(() => {
			currentIndexRef.current =
				(currentIndexRef.current + 1) % items.length;
			scrollToIndex(currentIndexRef.current);
		}, autoScrollIntervalMs);

		return () => {
			clearInterval(intervalId);
		};
	}, [autoScroll, autoScrollIntervalMs, items.length, scrollToIndex]);

	if (items.length === 0) {
		return null;
	}

	return (
		<View>
			<Animated.FlatList
				ref={flatListRef}
				data={items}
				horizontal
				keyExtractor={(item) => item.link}
				pagingEnabled={false}
				showsHorizontalScrollIndicator={false}
				snapToAlignment="start"
				snapToInterval={scrollInterval}
				decelerationRate="fast"
				bounces={false}
				onScroll={onScroll}
				onMomentumScrollEnd={(event) => {
					currentIndexRef.current = Math.round(
						event.nativeEvent.contentOffset.x / scrollInterval,
					);
				}}
				scrollEventThrottle={16}
				contentContainerStyle={{
					paddingHorizontal: HORIZONTAL_PADDING,
				}}
				ItemSeparatorComponent={() => (
					<View style={{ width: CARD_SPACING }} />
				)}
				renderItem={({ item, index }) => (
					<NewsCard
						item={item}
						index={index}
						cardWidth={cardWidth}
						scrollInterval={scrollInterval}
						scrollX={scrollX}
						onOpenLink={handleOpenLink}
					/>
				)}
			/>

			<View className="flex-row justify-center mt-3 gap-1.5">
				{items.map((item, index) => (
					<CarouselDot
						key={item.link}
						index={index}
						scrollInterval={scrollInterval}
						scrollX={scrollX}
					/>
				))}
			</View>
		</View>
	);
};

interface NewsCardProps {
	item: NewsItem;
	index: number;
	cardWidth: number;
	scrollInterval: number;
	scrollX: SharedValue<number>;
	onOpenLink: (link: string) => void;
}

const NewsCard = ({
	item,
	index,
	cardWidth,
	scrollInterval,
	scrollX,
	onOpenLink,
}: NewsCardProps) => {
	const animatedStyle = useAnimatedStyle(() => {
		const inputRange = [
			(index - 1) * scrollInterval,
			index * scrollInterval,
			(index + 1) * scrollInterval,
		];

		return {
			opacity: interpolate(
				scrollX.value,
				inputRange,
				[0.7, 1, 0.7],
				Extrapolation.CLAMP,
			),
			transform: [
				{
					scale: interpolate(
						scrollX.value,
						inputRange,
						[0.95, 1, 0.95],
						Extrapolation.CLAMP,
					),
				},
			],
		};
	});

	return (
		<Animated.View style={[{ width: cardWidth }, animatedStyle]}>
			<Pressable
				onPress={() => onOpenLink(item.link)}
				accessibilityRole="button"
				accessibilityLabel={item.label}
				accessibilityHint="Abre a notícia no navegador"
				className="h-44 overflow-hidden rounded-3xl border border-border bg-card"
			>
				<Image
					source={{ uri: item.image }}
					style={{
						position: "absolute",
						top: 0,
						right: 0,
						bottom: 0,
						left: 0,
					}}
					contentFit="cover"
					contentPosition="center"
				/>
				<View
					className="absolute inset-0"
					style={{
						experimental_backgroundImage:
							"linear-gradient(180deg, rgba(3, 7, 18, 0.04) 0%, rgba(3, 7, 18, 0.18) 42%, rgba(3, 7, 18, 0.82) 100%)",
					}}
				/>
				<View className="absolute bottom-4 left-4 right-4">
					<Text
						className="text-white font-bold text-base leading-5"
						numberOfLines={3}
					>
						{item.label}
					</Text>
				</View>
			</Pressable>
		</Animated.View>
	);
};

interface CarouselDotProps {
	index: number;
	scrollInterval: number;
	scrollX: SharedValue<number>;
}

const CarouselDot = ({ index, scrollInterval, scrollX }: CarouselDotProps) => {
	const animatedStyle = useAnimatedStyle(() => {
		const inputRange = [
			(index - 1) * scrollInterval,
			index * scrollInterval,
			(index + 1) * scrollInterval,
		];

		return {
			opacity: interpolate(
				scrollX.value,
				inputRange,
				[0.4, 1, 0.4],
				Extrapolation.CLAMP,
			),
			transform: [
				{
					scale: interpolate(
						scrollX.value,
						inputRange,
						[0.95, 1.55, 0.95],
						Extrapolation.CLAMP,
					),
				},
			],
		};
	});

	return (
		<Animated.View
			style={animatedStyle}
			className="w-2 h-2 rounded-full bg-primary"
		/>
	);
};
