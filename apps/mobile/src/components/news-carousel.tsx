import { Image } from "expo-image";
import { ChevronRight } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	AccessibilityInfo,
	findNodeHandle,
	Linking,
	Platform,
	Pressable,
	useWindowDimensions,
	View,
	type ViewStyle,
} from "react-native";
import Animated, {
	Extrapolation,
	interpolate,
	type SharedValue,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue,
} from "react-native-reanimated";

import { Text } from "@/components/ui/text";

import { useAccessibilityPreferences } from "@/hooks/use-accessibility-preferences";

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

function getWebScrollSnapStyle(isWeb: boolean): ViewStyle | undefined {
	if (!isWeb) {
		return undefined;
	}

	return {
		scrollSnapType: "x mandatory",
		scrollPaddingLeft: HORIZONTAL_PADDING,
		scrollPaddingRight: HORIZONTAL_PADDING,
	} as ViewStyle;
}

function getWebSnapItemStyle(isWeb: boolean): ViewStyle | undefined {
	if (!isWeb) {
		return undefined;
	}

	return {
		scrollSnapAlign: "start",
		scrollSnapStop: "always",
	} as ViewStyle;
}

function getNextIndex(currentIndex: number, lastIndex: number) {
	return currentIndex === lastIndex ? 0 : currentIndex + 1;
}

export const NewsCarousel = ({
	items,
	autoScroll = false,
	autoScrollIntervalMs = DEFAULT_AUTO_SCROLL_INTERVAL_MS,
}: NewsCarouselProps) => {
	const isWeb = Platform.OS === "web";
	const webScrollSnapStyle = getWebScrollSnapStyle(isWeb);
	const { width } = useWindowDimensions();
	const cardWidth = Math.max(width - HORIZONTAL_PADDING * 2, 280);
	const scrollInterval = cardWidth + CARD_SPACING;
	const scrollX = useSharedValue(0);
	const flatListRef = useRef<Animated.FlatList<NewsItem>>(null);
	const currentIndexRef = useRef(0);
	const [currentIndex, setCurrentIndex] = useState(0);
	const { reduceMotionEnabled, screenReaderEnabled } =
		useAccessibilityPreferences();
	const [isAutoScrolling, setIsAutoScrolling] = useState(
		autoScroll && !reduceMotionEnabled && !screenReaderEnabled,
	);
	const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const currentNewsItem = items[currentIndex] ?? items[0];
	const lastIndex = items.length - 1;

	// Ref used to move accessibility focus to the card after navigation
	const cardRef = useRef<View>(null);

	const handleOpenLink = useCallback((link: string) => {
		Linking.openURL(link).catch((error) => {
			console.error("Failed to open news link:", error);
		});
	}, []);

	const scrollToIndex = useCallback(
		(index: number) => {
			const nextIndex = Math.max(0, Math.min(index, items.length - 1));
			currentIndexRef.current = nextIndex;
			setCurrentIndex(nextIndex);
			flatListRef.current?.scrollToOffset({
				offset: nextIndex * scrollInterval,
				animated: true,
			});
		},
		[items.length, scrollInterval],
	);

	// Move accessibility focus to the card after navigation so the user
	// immediately hears the new headline without extra swipes.
	const focusCard = useCallback(() => {
		// Small delay to let the state update and render settle first
		setTimeout(() => {
			if (Platform.OS === "web") {
				cardRef.current?.focus?.();
				return;
			}

			const node = findNodeHandle(cardRef.current);
			if (node) {
				AccessibilityInfo.setAccessibilityFocus(node);
			}
		}, 100);
	}, []);

	const handleNext = useCallback(() => {
		const nextIndex = getNextIndex(currentIndexRef.current, lastIndex);
		scrollToIndex(nextIndex);
		focusCard();
	}, [scrollToIndex, lastIndex, focusCard]);

	const onScroll = useAnimatedScrollHandler({
		onScroll: (event) => {
			scrollX.set(event.contentOffset.x);
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

	// Sync isAutoScrolling with prop and accessibility preferences
	useEffect(() => {
		setIsAutoScrolling(
			autoScroll && !reduceMotionEnabled && !screenReaderEnabled,
		);
	}, [autoScroll, reduceMotionEnabled, screenReaderEnabled]);

	if (items.length === 0) {
		return null;
	}

	if (screenReaderEnabled) {
		const nextLabel =
			currentIndex === lastIndex
				? "Ir para a primeira notícia"
				: "Próxima notícia";

		return (
			<View>
				<View className="items-center px-4">
					{currentNewsItem ? (
						<NewsCard
							ref={cardRef}
							item={currentNewsItem}
							index={currentIndex}
							length={items.length}
							cardWidth={cardWidth}
							scrollInterval={scrollInterval}
							scrollX={scrollX}
							onOpenLink={handleOpenLink}
							isWeb={isWeb}
						/>
					) : null}
				</View>

				<View className="absolute top-1/2 right-0 -translate-y-1/2">
					<Pressable
						onPress={handleNext}
						accessibilityRole="button"
						accessibilityLabel={nextLabel}
						accessibilityHint="Navega em loop entre as notícias"
						className="h-11 w-11 items-center justify-center rounded-full bg-primary/80"
					>
						<ChevronRight
							size={18}
							color="white"
							aria-hidden={true}
						/>
					</Pressable>
				</View>
			</View>
		);
	}

	return (
		<View>
			<Animated.FlatList
				ref={flatListRef}
				data={items}
				horizontal
				keyExtractor={(item) => item.link}
				style={webScrollSnapStyle}
				pagingEnabled={false}
				showsHorizontalScrollIndicator={false}
				snapToAlignment={isWeb ? undefined : "start"}
				snapToInterval={isWeb ? undefined : scrollInterval}
				snapToOffsets={
					isWeb
						? undefined
						: items.map((_, index) => index * scrollInterval)
				}
				decelerationRate="fast"
				bounces={false}
				onScroll={onScroll}
				onScrollBeginDrag={() => {
					// Pause auto-scroll when user starts interacting
					if (isAutoScrolling) {
						setIsAutoScrolling(false);
						if (resumeTimeoutRef.current) {
							clearTimeout(resumeTimeoutRef.current);
						}
						// Only schedule resume if neither reduceMotion nor screen reader is enabled
						if (!reduceMotionEnabled && !screenReaderEnabled) {
							resumeTimeoutRef.current = setTimeout(() => {
								setIsAutoScrolling(
									autoScroll &&
										!reduceMotionEnabled &&
										!screenReaderEnabled,
								);
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
						length={items.length}
						cardWidth={cardWidth}
						scrollInterval={scrollInterval}
						scrollX={scrollX}
						isWeb={isWeb}
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
						currentIndex={currentIndex}
						onPress={() => {
							currentIndexRef.current = index;
							setCurrentIndex(index);
							scrollToIndex(index);
						}}
					/>
				))}
			</View>

			{/* Live region announces slide changes to screen readers during swipe */}
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
	length: number;
	cardWidth: number;
	scrollInterval: number;
	scrollX: SharedValue<number>;
	isWeb: boolean;
	onOpenLink: (link: string) => void;
	ref?: React.Ref<View>;
}

const NewsCard = ({
	item,
	index,
	length,
	cardWidth,
	scrollInterval,
	scrollX,
	isWeb,
	onOpenLink,
	ref,
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
		};
	});
	const webSnapItemStyle = getWebSnapItemStyle(isWeb);

	return (
		<Animated.View
			style={[{ width: cardWidth }, webSnapItemStyle, animatedStyle]}
		>
			<Pressable
				ref={ref}
				onPress={() => onOpenLink(item.link)}
				accessibilityRole="button"
				accessibilityLabel={`Notícia ${index + 1} de ${length}: ${item.label}`}
				accessibilityHint="Abre a notícia no navegador"
				className="h-44 overflow-hidden rounded-3xl border border-border bg-card active:opacity-90"
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
			accessibilityHint="Vai direto para essa notícia"
			accessibilityState={{ selected }}
		>
			<Animated.View
				style={animatedStyle}
				className={`w-2 h-2 rounded-full ${selected ? "bg-primary" : "bg-primary/50"}`}
			/>
		</Pressable>
	);
};
