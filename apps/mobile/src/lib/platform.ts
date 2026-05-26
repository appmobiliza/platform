import { Platform } from "react-native";

// src/lib/platform.ts
export const webClass = (classes: string): string =>
	Platform.OS === "web" ? classes : "";
