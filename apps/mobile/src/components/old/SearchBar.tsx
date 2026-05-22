import { View, TextInput, TouchableOpacity, Text, useWindowDimensions } from "react-native";
import { Search, Calendar } from "lucide-react-native";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (text: string) => void;
  onSchedule?: () => void;
}

export const SearchBar = ({ placeholder, onSearch, onSchedule }: SearchBarProps) => {
  const { width } = useWindowDimensions();
  // Consideramos "muito pequeno" telas com menos de 400px de largura
  const isSmallScreen = width < 415;

  return (
    <View className="flex-row items-center bg-white rounded-full p-[6px] border border-gray-800">
      <View className="pl-4 pr-2">
        <Search size={20} color="#111827" />
      </View>
      <TextInput
        className="flex-1 h-12 text-base text-gray-900"
        placeholder={placeholder || "Buscar..."}
        placeholderTextColor="#6B7280"
        onChangeText={onSearch}
        accessibilityLabel={placeholder || "Buscar"}
        accessibilityHint="Digite para buscar locais"
      />
      <TouchableOpacity
        onPress={onSchedule}
        activeOpacity={0.8}
        style={{ flexShrink: 0 }}
        className={`flex-row items-center justify-center bg-[#006971] rounded-full ml-1 ${isSmallScreen ? 'w-[42px] h-[42px]' : 'px-2 py-[10px] gap-2'
          }`}
        accessibilityLabel="Agendar deslocamento"
        accessibilityRole="button"
      >
        <Calendar size={isSmallScreen ? 20 : 18} color="white" />
        {!isSmallScreen && (
          <Text
            className="text-white font-medium text-sm"
            numberOfLines={1}
            style={{ flexShrink: 0 }}
          >
            Agendar
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
