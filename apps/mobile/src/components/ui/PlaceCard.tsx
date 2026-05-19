import { View, Text, TouchableOpacity } from "react-native";
import { Clock, Star, MapPin } from "lucide-react-native";
import { cn } from "../../utils/cn";

interface PlaceCardProps {
  title: string;
  subtitle: string;
  iconType: "clock" | "star" | "map";
  layout?: "full" | "half";
  className?: string;
  onPress?: () => void;
}

export const PlaceCard = ({ title, subtitle, iconType, layout = "full", className, onPress }: PlaceCardProps) => {
  const Icon = iconType === "clock" ? Clock : iconType === "star" ? Star : MapPin;
  
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityLabel={`${title}: ${subtitle}`}
      accessibilityHint="Duplo toque para ver detalhes"
      accessibilityRole="button"
      className={cn(
        "bg-white rounded-xl p-4 border border-gray-800 flex-row items-center gap-4",
        layout === "half" ? "flex-1 flex-col items-start gap-2" : "w-full",
        className
      )}
    >
      <View className="p-2 rounded-xl bg-[#006971]">
        <Icon size={22} color="white" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-bold text-[15px]" numberOfLines={1}>
          {title}
        </Text>
        <Text className="text-gray-700 text-xs mt-0.5" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
