import { View, Text, TouchableOpacity } from "react-native";
import { Clock, RotateCcw } from "lucide-react-native";

interface SimpleHistoryItemProps {
  title: string;
  subtitle: string;
  onPress: () => void;
}

export const SimpleHistoryItem = ({ title, subtitle, onPress }: SimpleHistoryItemProps) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={onPress}
      className="flex-row items-center py-4 gap-4 border-b border-gray-100"
    >
      <View className="bg-[#006971] w-14 h-14 rounded-2xl items-center justify-center shadow-sm">
        <Clock size={20} color="white" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-bold text-[15px]" numberOfLines={2}>{title}</Text>
        <Text className="text-gray-500 text-xs mt-0.5">{subtitle}</Text>
      </View>
      <TouchableOpacity 
        activeOpacity={0.8}
        className="flex-row items-center bg-gray-200/80 px-4 py-2.5 rounded-full gap-1.5"
      >
        <RotateCcw size={14} color="#374151" />
        <Text className="text-gray-700 font-medium text-xs">Reagendar</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};
