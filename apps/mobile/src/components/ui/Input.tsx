import { forwardRef } from "react";
import { Text, TextInput, View } from "react-native";

interface InputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
	label?: string;
	error?: string;
	containerClassName?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
	({ label, error, containerClassName, className, ...props }, ref) => {
		return (
			<View
				className={["w-full", containerClassName]
					.filter(Boolean)
					.join(" ")}
			>
				{label && (
					<Text className="text-neutral-700 font-medium mb-2 text-sm">
						{label}
					</Text>
				)}
				<TextInput
					ref={ref}
					className={[
						"w-full bg-white border border-neutral-300 rounded-xl px-4 py-4 text-base text-neutral-900",
						error && "border-red-500",
						className,
					]
						.filter(Boolean)
						.join(" ")}
					placeholderTextColor="#a3a3a3"
					accessibilityLabel={label}
					accessibilityHint={props.placeholder}
					{...props}
				/>
				{error && (
					<Text className="text-red-500 text-xs mt-1">{error}</Text>
				)}
			</View>
		);
	},
);

Input.displayName = "Input";
