"use client";

import type * as React from "react";

import { Avatar as AvatarPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function hashString(value: string) {
	let hash = 0;

	for (let index = 0; index < value.length; index += 1) {
		hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
	}

	return hash;
}

function getFallbackSeed(children: React.ReactNode): string {
	if (typeof children === "string" || typeof children === "number") {
		return String(children);
	}

	if (Array.isArray(children)) {
		return children.map(getFallbackSeed).join("");
	}

	return "avatar";
}

function getFallbackColors(seed: string) {
	const hash = hashString(seed);
	const hue = hash % 360;
	const backgroundSaturation = 72 + ((hash >>> 8) % 12);
	const backgroundLightness = 88 + ((hash >>> 16) % 6);
	const textSaturation = 78 + ((hash >>> 4) % 10);
	const textLightness = 22 + ((hash >>> 12) % 8);

	return {
		backgroundColor: `hsl(${hue} ${backgroundSaturation}% ${backgroundLightness}%)`,
		color: `hsl(${hue} ${textSaturation}% ${textLightness}%)`,
	};
}

function Avatar({
	className,
	size = "default",
	...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
	size?: "default" | "sm" | "lg";
}) {
	return (
		<AvatarPrimitive.Root
			data-slot="avatar"
			data-size={size}
			className={cn(
				"group/avatar relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken data-[size=lg]:size-10 data-[size=sm]:size-6 dark:after:mix-blend-lighten",
				className,
			)}
			{...props}
		/>
	);
}

function AvatarImage({
	className,
	...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
	return (
		<AvatarPrimitive.Image
			data-slot="avatar-image"
			className={cn(
				"aspect-square size-full rounded-full object-cover",
				className,
			)}
			{...props}
		/>
	);
}

function AvatarFallback({
	className,
	...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
	const seed = getFallbackSeed(props.children);
	const { backgroundColor, color } = getFallbackColors(seed);

	return (
		<AvatarPrimitive.Fallback
			data-slot="avatar-fallback"
			style={{
				backgroundColor,
				color,
			}}
			className={cn(
				"flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs",
				className,
			)}
			{...props}
		/>
	);
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="avatar-badge"
			className={cn(
				"absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground bg-blend-color ring-2 ring-background select-none",
				"group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
				"group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
				"group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
				className,
			)}
			{...props}
		/>
	);
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="avatar-group"
			className={cn(
				"group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
				className,
			)}
			{...props}
		/>
	);
}

function AvatarGroupCount({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="avatar-group-count"
			className={cn(
				"relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
				className,
			)}
			{...props}
		/>
	);
}

export {
	Avatar,
	AvatarBadge,
	AvatarFallback,
	AvatarGroup,
	AvatarGroupCount,
	AvatarImage,
};
