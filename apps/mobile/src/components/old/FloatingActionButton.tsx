import { TouchableOpacity, Text, View } from "react-native";
import { Mic } from "lucide-react-native";

export const FloatingActionButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="absolute bottom-6 right-6 z-50 bg-[#006971] flex-row items-center px-5 py-3.5 rounded-full gap-3"
      style={{
        shadowColor: "#006971",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      }}
      accessibilityLabel="Solicitar atendimento"
      accessibilityHint="Duplo toque para solicitar um bolsista"
      accessibilityRole="button"
    >
      <Mic size={22} color="white" />
      <Text className="text-white font-medium text-base">Solicitar atendimento</Text>
    </TouchableOpacity>
  );
};
