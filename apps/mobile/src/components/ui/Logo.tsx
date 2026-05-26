import { View, Text } from "react-native";
import { Accessibility } from "lucide-react-native";
import { Image } from "expo-image";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  light?: boolean;
}

export function Logo({ size = "lg", light = false }: LogoProps) {
  const sizes = {
    sm: "w-24 h-8",
    md: "w-32 h-10",
    lg: "w-48 h-16",
    xl: "w-64 h-24",
  };

  // The user placed Logo_landscape2.svg in assets/
  return (
    <Image 
      source={require("../../../assets/Logo_landscape2.svg")} 
      className={sizes[size]} 
      contentFit="contain"
      tintColor={light ? "#ffffff" : undefined}
    />
  );
}
