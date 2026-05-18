import { forwardRef } from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

interface ButtonProps
	extends React.ComponentPropsWithoutRef<typeof TouchableOpacity> {
	variant?: "primary" | "secondary" | "outline" | "ghost";
	size?: "sm" | "md" | "lg";
	loading?: boolean;
	textClassName?: string;
}

export const Button = forwardRef<
	React.ElementRef<typeof TouchableOpacity>,
	ButtonProps
>(
	(
		{
			className,
			variant = "primary",
			size = "md",
			loading = false,
			children,
			disabled,
			textClassName,
			...props
		},
		ref,
	) => {
		const baseClass = "flex-row items-center justify-center rounded-xl";

		const variants = {
			primary: "bg-neutral-800",
			secondary: "bg-brand-primary",
			outline: "border-2 border-neutral-200 bg-transparent",
			ghost: "bg-transparent",
		};

		const sizes = {
			sm: "px-4 py-2",
			md: "px-6 py-4",
			lg: "px-8 py-5",
		};

		const textVariants = {
      primary: "text-white font-semibold text-base",
			secondary: "text-white font-semibold text-base",
			outline: "text-neutral-800 font-semibold text-base",
			ghost: "text-neutral-600 font-semibold text-base",
		};

		return (
			<TouchableOpacity
				ref={ref}
				activeOpacity={0.8}
				className={[
					baseClass,
					variants[variant],
					sizes[size],
					disabled && "opacity-50",
					className,
				]
					.filter(Boolean)
					.join(" ")}
				disabled={disabled || loading}
				{...props}
			>
				{loading ? (
					<ActivityIndicator
						color={
							variant === "outline" || variant === "ghost"
								? "#262626"
								: "#ffffff"
						}
					/>
				) : typeof children === "string" ? (
					<Text
						className={[textVariants[variant], textClassName]
							.filter(Boolean)
							.join(" ")}
					>
						{children}
					</Text>
				) : (
					children
				)}
			</TouchableOpacity>
		);
	},
);

Button.displayName = "Button";
