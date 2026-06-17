import { Search, SearchAlert } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useAccessibilityPreferences } from "@/hooks/use-accessibility-preferences";

import { cn } from "@/lib/utils";

import { Icon } from "./ui/icon";

const DEFAULT_PLACEHOLDER = "Buscar por localizações";

type AnimationPhase = "typing" | "pausing" | "deleting";

interface SearchBarProps {
	examples?: string[];
	placeholder?: string;
	onPress?: () => void;
	hasConnection?: boolean;
}

interface SearchBarContentProps {
	text: string;
	onPress?: () => void;
	accessibilityHint: string;
	disabled?: boolean;
}

function SearchBarContent({
	text,
	onPress,
	accessibilityHint,
	disabled,
}: SearchBarContentProps) {
	return (
		<Pressable
			onPress={onPress}
			disabled={disabled}
			accessibilityRole="button"
			accessibilityLabel={
				disabled
					? "Busca indisponível pois não há conexão com a internet"
					: "Abrir busca"
			}
			accessibilityHint={accessibilityHint}
			className="w-full"
		>
			<View
				className={cn(
					"relative h-14 w-full flex-row items-center rounded-full border border-border bg-card px-4 shadow-sm shadow-black/5 dark:border-transparent dark:bg-input/50",
					{
						"opacity-50": disabled,
					},
				)}
			>
				<Icon
					icon={disabled ? SearchAlert : Search}
					size={20}
					color="--foreground"
					style={{ marginRight: 12 }}
				/>

				<Text
					className="flex-1 text-lg font-medium text-foreground"
					numberOfLines={1}
					ellipsizeMode="tail"
				>
					{disabled ? "Sem conexão com a internet" : text}
				</Text>
			</View>
		</Pressable>
	);
}

interface AnimatedSearchBarProps {
	examples: string[];
	onPress?: () => void;
	accessibilityHint: string;
}

function AnimatedSearchBar({
	examples,
	onPress,
	accessibilityHint,
}: AnimatedSearchBarProps) {
	const [exampleIndex, setExampleIndex] = useState(0);
	const [displayedText, setDisplayedText] = useState("");
	const [phase, setPhase] = useState<AnimationPhase>("typing");

	useEffect(() => {
		const currentExample = examples[exampleIndex] ?? "";
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
						(currentIndex) => (currentIndex + 1) % examples.length,
					);
					setPhase("typing");
				}, 160);
			}
		}

		return () => clearTimeout(timeout);
	}, [displayedText, exampleIndex, phase, examples]);

	return (
		<SearchBarContent
			text={displayedText}
			onPress={onPress}
			accessibilityHint={accessibilityHint}
		/>
	);
}

export function SearchBar({
	examples,
	placeholder,
	onPress,
	hasConnection = true,
}: SearchBarProps) {
	const activeExamples = examples?.length ? examples : [];

	const { reduceMotionEnabled, screenReaderEnabled } =
		useAccessibilityPreferences();

	const useStaticPlaceholder =
		reduceMotionEnabled ||
		screenReaderEnabled ||
		activeExamples.length === 0;

	const accessibilityHint = "Abre a tela de solicitação";

	if (useStaticPlaceholder || !hasConnection) {
		return (
			<SearchBarContent
				text={placeholder ?? DEFAULT_PLACEHOLDER}
				onPress={onPress}
				accessibilityHint={accessibilityHint}
				disabled={!hasConnection}
			/>
		);
	}

	return (
		<AnimatedSearchBar
			key={activeExamples.join("|")}
			examples={activeExamples}
			onPress={onPress}
			accessibilityHint={accessibilityHint}
		/>
	);
}
