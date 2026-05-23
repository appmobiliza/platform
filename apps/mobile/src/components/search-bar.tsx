import { useEffect, useState } from "react";

import { Search } from "lucide-react-native";
import { styled } from "nativewind";
import { Pressable, Text, View } from "react-native";

import { useAccessibilityPreferences } from "@/hooks/useAccessibilityPreferences";

const SearchIcon = styled(Search);

const DEFAULT_PLACEHOLDER = "Buscar por localizações";

type AnimationPhase = "typing" | "pausing" | "deleting";

interface SearchBarProps {
	examples?: string[];
	placeholder?: string;
	onPress?: () => void;
}

export function SearchBar({ examples, placeholder, onPress }: SearchBarProps) {
	const activeExamples = examples?.length ? examples : [];
	const fixedPlaceholder = placeholder ?? DEFAULT_PLACEHOLDER;
	const accessibilityLabel = "Abrir busca";
	const accessibilityHint = activeExamples.length
		? `Abre a tela de busca. Exemplos: ${activeExamples.join(", ")}.`
		: "Abre a tela de busca.";
	const { reduceMotionEnabled, screenReaderEnabled } =
		useAccessibilityPreferences();
	const useStaticPlaceholder =
		reduceMotionEnabled ||
		screenReaderEnabled ||
		activeExamples.length === 0;
	const [exampleIndex, setExampleIndex] = useState(0);
	const [displayedText, setDisplayedText] = useState("");
	const [phase, setPhase] = useState<AnimationPhase>("typing");

	useEffect(() => {
		if (useStaticPlaceholder) {
			setDisplayedText("");
			setExampleIndex(0);
			setPhase("typing");
			return;
		}

		const currentExample = activeExamples[exampleIndex];
		let timeout: ReturnType<typeof setTimeout>;

		if (phase === "typing") {
			if (displayedText.length < currentExample.length) {
				timeout = setTimeout(() => {
					setDisplayedText(
						currentExample.slice(0, displayedText.length + 1),
					);
				}, 70);
			} else {
				timeout = setTimeout(() => {
					setPhase("pausing");
				}, 1200);
			}
		} else if (phase === "pausing") {
			timeout = setTimeout(() => {
				setPhase("deleting");
			}, 500);
		} else {
			if (displayedText.length > 0) {
				timeout = setTimeout(() => {
					setDisplayedText(
						currentExample.slice(0, displayedText.length - 1),
					);
				}, 35);
			} else {
				timeout = setTimeout(() => {
					setExampleIndex(
						(currentIndex) =>
							(currentIndex + 1) % activeExamples.length,
					);
					setPhase("typing");
				}, 160);
			}
		}

		return () => clearTimeout(timeout);
	}, [
		activeExamples,
		displayedText,
		exampleIndex,
		phase,
		useStaticPlaceholder,
	]);

	const visibleText = useStaticPlaceholder ? fixedPlaceholder : displayedText;

	return (
		<Pressable
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel}
			accessibilityHint={accessibilityHint}
			className="w-full"
		>
			<View className="w-full flex-row items-center relative rounded-full border dark:border-transparent bg-input border-border dark:bg-input/50 h-14 px-4 shadow-sm shadow-black/5">
				<SearchIcon className="text-foreground mr-3" size={20} />
				<Text
					className="flex-1 text-foreground text-lg font-medium"
					numberOfLines={1}
					ellipsizeMode="tail"
				>
					{visibleText}
				</Text>
			</View>
		</Pressable>
	);
}
