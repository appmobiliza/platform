import { View, Text, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView } from "react-native";
import { ArrowLeft, XCircle, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditSavedPlace() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View 
        className="px-6 pb-6 bg-white flex-col gap-4"
        style={{ paddingTop: Math.max(insets.top + 10, Platform.OS === 'ios' ? 50 : 30) }}
      >
        <TouchableOpacity 
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="p-2 -ml-2 self-start"
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-gray-900 font-bold text-3xl">Editar local salvo</Text>
      </View>

      <View className="flex-1 px-6 pt-2">
        <View className="mb-8">
          <Text className="text-gray-900 font-semibold text-base mb-2">Apelido do local</Text>
          <View className="flex-row items-center border border-gray-200 rounded-lg px-4 py-3.5 bg-white">
            <TextInput 
              className="flex-1 text-gray-500 text-base p-0"
              defaultValue="Banquinho da Meteorologia"
            />
            <TouchableOpacity className="p-1">
              <XCircle size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-gray-900 font-semibold text-base mb-2">Endereço</Text>
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => router.push("/saved/address")}
            className="flex-row items-center justify-between py-1"
          >
            <Text className="text-gray-500 text-base flex-1" numberOfLines={1}>
              Instituto de Jornalismo, UFAL
            </Text>
            <ChevronRight size={20} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-6 pt-4 bg-white" style={{ paddingBottom: Math.max(insets.bottom + 16, 24) }}>
        <TouchableOpacity 
          activeOpacity={0.8}
          className="bg-[#2D2D2D] w-full py-4 rounded-xl items-center justify-center"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold text-base">Salvar local</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
