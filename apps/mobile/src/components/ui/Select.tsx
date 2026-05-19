import { View, Text, TouchableOpacity, Modal, FlatList, Pressable } from "react-native";
import { useState, forwardRef } from "react";
import { ChevronDown, X } from "lucide-react-native";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  value?: string;
  placeholder?: string;
  error?: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
  containerClassName?: string;
  className?: string;
}

export const Select = forwardRef<React.ElementRef<typeof TouchableOpacity>, SelectProps>(
  ({ label, value, placeholder, error, options, onSelect, containerClassName, className, ...props }, ref) => {
    const [modalVisible, setModalVisible] = useState(false);

    const selectedOption = options.find((opt) => opt.value === value);

    const handleSelect = (val: string) => {
      onSelect(val);
      setModalVisible(false);
    };

    return (
      <View className={["w-full", containerClassName].filter(Boolean).join(" ")}>
        {label && <Text className="text-neutral-700 font-medium mb-2 text-sm">{label}</Text>}
        <TouchableOpacity
          ref={ref}
          activeOpacity={0.7}
          onPress={() => setModalVisible(true)}
          className={[
            "w-full bg-white border border-neutral-300 rounded-xl px-4 py-4 flex-row items-center justify-between",
            error && "border-red-500",
            className,
          ].filter(Boolean).join(" ")}
          accessibilityLabel={label}
          accessibilityHint="Duplo toque para abrir opções"
          accessibilityRole="button"
          {...props}
        >
          <Text className={selectedOption ? "text-neutral-900 text-base" : "text-neutral-400 text-base"}>
            {selectedOption ? selectedOption.label : placeholder || "Selecione..."}
          </Text>
          <ChevronDown size={20} color="#525252" />
        </TouchableOpacity>
        {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}

        <Modal visible={modalVisible} transparent animationType="fade">
          <Pressable 
            className="flex-1 justify-end bg-black/40" 
            onPress={() => setModalVisible(false)}
          >
            <Pressable 
              className="bg-white rounded-t-3xl max-h-[70%] min-h-[40%]"
              onPress={(e) => e.stopPropagation()}
            >
              <View className="flex-row items-center justify-between px-6 py-4 border-b border-neutral-200">
                <Text className="text-lg font-bold text-neutral-900">{label || "Selecione"}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 -mr-2"
                  accessibilityLabel="Fechar"
                  accessibilityRole="button"
                >
                  <X size={24} color="#525252" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                contentContainerStyle={{ padding: 16 }}
                accessibilityRole="list"
                accessibilityLabel={`Opções de ${label || "seleção"}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleSelect(item.value)}
                    accessibilityLabel={item.label}
                    accessibilityRole="button"
                    className={[
                      "py-4 px-4 rounded-xl mb-2",
                      item.value === value ? "bg-brand-primary/10" : "bg-transparent",
                    ].filter(Boolean).join(" ")}
                  >
                    <Text 
                      className={[
                        "text-base", 
                        item.value === value ? "text-brand-primary font-bold" : "text-neutral-800 font-medium"
                      ].filter(Boolean).join(" ")}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    );
  }
);

Select.displayName = "Select";
