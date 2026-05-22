import { View, Text, TouchableOpacity, Platform } from "react-native";
import MapView from "./Map";
import { Star, RotateCcw } from "lucide-react-native";

interface FeaturedHistoryCardProps {
  title: string;
  date: string;
  onPress?: () => void;
}

export const FeaturedHistoryCard = ({ title, date, onPress }: FeaturedHistoryCardProps) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={onPress}
      accessibilityLabel={`Deslocamento: ${title}`}
      accessibilityHint="Duplo toque para ver detalhes"
      accessibilityRole="button"
      className="rounded-[24px] overflow-hidden mb-6 border border-gray-100 shadow-sm"
    >
      <View className="h-40 w-full bg-gray-200">
        <MapView 
          style={{ flex: 1 }}
          initialRegion={{
            latitude: -9.5539,
            longitude: -35.7722, // Approximate UFAL coordinates
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
        />
      </View>
      <View className="bg-[#006971] p-5">
        <Text className="text-white font-bold text-xl">{title}</Text>
        <Text className="text-white/80 text-sm mt-1">{date}</Text>
        
        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity className="flex-row items-center border border-white px-4 py-2 rounded-full gap-2">
            <Star size={16} color="white" />
            <Text className="text-white font-medium text-sm">Avaliar</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center bg-white px-4 py-2 rounded-full gap-2">
            <RotateCcw size={16} color="#006971" />
            <Text className="text-[#006971] font-medium text-sm">Reagendar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};
