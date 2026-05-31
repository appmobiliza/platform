import { Slot } from "@rn-primitives/slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Platform, View } from "react-native";

import { TextClassContext } from "@/components/ui/text";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
	cn(
		"border-border group shrink-0 flex-row items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5",
		Platform.select({
			web: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive w-fit whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] [&>svg]:pointer-events-none [&>svg]:size-3",
		}),
	),
	{
		variants: {
			variant: {
				default: cn(
					"border-transparent bg-primary",
					Platform.select({ web: "[a&]:hover:bg-primary/90" }),
				),
				secondary: cn(
					"border-transparent bg-secondary",
					Platform.select({ web: "[a&]:hover:bg-secondary/90" }),
				),
				success: cn(
					"border-transparent bg-success-muted",
					Platform.select({
						web: "[a&]:hover:bg-success-muted-hover",
					}),
				),
				warning: cn(
					"border-transparent bg-warning-muted",
					Platform.select({
						web: "[a&]:hover:bg-warning-muted-hover",
					}),
				),
				info: cn(
					"border-transparent bg-info-muted",
					Platform.select({ web: "[a&]:hover:bg-info-muted-hover" }),
				),
				destructive: cn(
					"border-transparent bg-destructive-muted",
					Platform.select({
						web: "[a&]:hover:bg-destructive-muted-hover",
					}),
				),
				outline: Platform.select({
					web: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
				}),
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

const badgeTextVariants = cva("text-xs font-medium", {
	variants: {
		variant: {
			default: "text-primary-foreground",
			secondary: "text-secondary-foreground",
			success: "text-success-foreground",
			warning: "text-warning-foreground",
			info: "text-info-foreground",
			destructive: "text-destructive-foreground",
			outline: "text-foreground",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

type BadgeProps = React.ComponentProps<typeof View> &
	React.RefAttributes<View> & {
		asChild?: boolean;
	} & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, asChild, ...props }: BadgeProps) {
	const Component = asChild ? Slot : View;
	return (
		<TextClassContext.Provider value={badgeTextVariants({ variant })}>
			<Component
				className={cn(badgeVariants({ variant }), className)}
				{...props}
			/>
		</TextClassContext.Provider>
	);
}

export type { BadgeProps };
export { Badge, badgeTextVariants, badgeVariants };
