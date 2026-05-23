import { useCallback, useEffect, useRef, useState } from "react";

import { Image } from "expo-image";
import { Pause, Play } from "lucide-react-native";
import { AccessibilityInfo, Linking, Pressable, useWindowDimensions, View } from "react-native";
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
const RESUME_AUTO_SCROLL_DELAY_MS = 5000;

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
	const [currentIndex, setCurrentIndex] = useState(0);
	const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);
	const [isAutoScrolling, setIsAutoScrolling] = useState(autoScroll && !reduceMotionEnabled);
	const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
		if (!isAutoScrolling || items.length < 2) {
			return;
		}

		const intervalId = setInterval(() => {
			currentIndexRef.current =
				(currentIndexRef.current + 1) % items.length;
			setCurrentIndex(currentIndexRef.current);
			scrollToIndex(currentIndexRef.current);
		}, autoScrollIntervalMs);

		return () => {
			clearInterval(intervalId);
		};
	}, [isAutoScrolling, autoScrollIntervalMs, items.length, scrollToIndex]);

	useEffect(() => {
		let isMounted = true;

		AccessibilityInfo.isReduceMotionEnabled()
			.then((value) => {
				if (isMounted) setReduceMotionEnabled(value);
			})
			.catch(() => {
				if (isMounted) setReduceMotionEnabled(false);
			});

		const subscription = AccessibilityInfo.addEventListener(
			'reduceMotionChanged',
			(value) => {
				if (isMounted) setReduceMotionEnabled(value);
			}
		);

		return () => {
			isMounted = false;
			try {
				const sub = subscription as
					| { remove?: () => void }
					| (() => void)
					| undefined;
				if (sub && typeof (sub as { remove?: () => void }).remove === "function") {
					(sub as { remove: () => void }).remove();
				} else if (typeof subscription === "function") {
					// older RN returns an unsubscribe function
					(subscription as unknown as () => void)();
				}
			} catch {
				// ignore
			}
		};
	}, []);

	// Sync isAutoScrolling with prop and reduced motion preference
	useEffect(() => {
		setIsAutoScrolling(autoScroll && !reduceMotionEnabled);
	}, [autoScroll, reduceMotionEnabled]);

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
				onScrollBeginDrag={() => {
					// pause auto-scroll when user starts interacting
					if (isAutoScrolling) {
						setIsAutoScrolling(false);
						if (resumeTimeoutRef.current) {
							clearTimeout(resumeTimeoutRef.current);
						}
						if (!reduceMotionEnabled) {
							resumeTimeoutRef.current = setTimeout(() => {
								setIsAutoScrolling(autoScroll && !reduceMotionEnabled);
							}, RESUME_AUTO_SCROLL_DELAY_MS);
						}
					}
				}}
				onMomentumScrollEnd={(event) => {
					const idx = Math.round(
						event.nativeEvent.contentOffset.x / scrollInterval,
					);
					currentIndexRef.current = idx;
					setCurrentIndex(idx);
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

			{autoScroll && !reduceMotionEnabled && (
				<View className="flex-row justify-center mt-3 mb-2 absolute right-8">
					<Pressable
						onPress={() => {
							setIsAutoScrolling((s) => !s);
						}}
						accessibilityRole="button"
						accessibilityLabel={
							isAutoScrolling
								? "Pausar auto-scroll"
								: "Retomar auto-scroll"
						}
						className="p-3 rounded-full bg-primary/80"
					>
						<Text className="text-sm text-white sr-only">
							{isAutoScrolling ? "Pausar" : "Retomar"}
						</Text>
						{isAutoScrolling ? (
							<Pause size={16} color="white" />
						) : (
							<Play size={16} color="white" />
						)}
					</Pressable>
				</View>
			)}

			<View className="flex-row justify-center mt-1 gap-1.5">
				{items.map((item, index) => (
					<CarouselDot
						key={item.link}
						index={index}
						scrollInterval={scrollInterval}
						scrollX={scrollX}
						currentIndex={currentIndex}
						onPress={() => {
							currentIndexRef.current = index;
							setCurrentIndex(index);
							scrollToIndex(index);
						}}
					/>
				))}
			</View>

			{/* Live region for screen readers to announce current slide */}
			<Text
				accessible
				accessibilityLiveRegion="polite"
				style={{ position: "absolute", left: -9999 }}
			>
				{`Notícia ${currentIndex + 1} de ${items.length}`}
			</Text>
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
	currentIndex?: number;
	onPress?: () => void;
}

const CarouselDot = ({
	index,
	scrollInterval,
	scrollX,
	currentIndex,
	onPress,
}: CarouselDotProps) => {
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

	const selected =
		typeof currentIndex === "number" ? currentIndex === index : false;

	return (
		<Pressable
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel={`Notícia ${index + 1}`}
			accessibilityState={{ selected }}
		>
			<Animated.View
				style={animatedStyle}
				className={`w-2 h-2 rounded-full ${selected ? "bg-primary" : "bg-primary/50"}`}
			/>
		</Pressable>
	);
};
