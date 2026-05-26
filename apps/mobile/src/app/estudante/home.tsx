import { View, Text, ScrollView, SafeAreaView, StatusBar, Platform } from "react-native";
import { SearchBar } from "../../components/ui/SearchBar";
import { PlaceCard } from "../../components/ui/PlaceCard";
import { NewsCarousel } from "../../components/ui/NewsCarousel";
import { FloatingActionButton } from "../../components/ui/FloatingActionButton";
import { Logo } from "../../components/ui/Logo";

export default function Home() {
  return (
    <View className="flex-1 bg-brand-background">
      <StatusBar barStyle="light-content" backgroundColor="#00635D" />

      {/* Header Escuro */}
      <View className="bg-[#006971] pt-14 pb-20 px-6 items-center">
        <Logo size="lg" light />
      </View>

      {/* Main Content - Scrollable */}
      <View className="flex-1 bg-[#006971] -mt-10">
        <View className="flex-1 bg-white rounded-t-[32px] overflow-hidden">
          <ScrollView
            className="flex-1 px-6 pt-10"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {/* Título Centralizado */}
            <Text
              className="text-gray-900 font-bold text-[32px] mb-6 text-center"
            >
              Para onde vamos?
            </Text>

            <View className="mb-6">
              <SearchBar placeholder="Biblioteca Central" />
            </View>

            {/* Locais Recentes */}
            <View className="mb-2">
              <PlaceCard
                title="Restaurante Universitário"
                subtitle="Hoje, 12h35"
                iconType="star"
                className="mb-3"
              />
              <View className="flex-row gap-3">
                <PlaceCard
                  title="CECA"
                  subtitle="Ontem, 16h12"
                  iconType="clock"
                  layout="half"
                />
                <PlaceCard
                  title="IQB"
                  subtitle="Há 2 dias, 16h24"
                  iconType="clock"
                  layout="half"
                />
              </View>
            </View>

            {/* Notícias */}
            <NewsCarousel />

            {/* Rotas Frequentes */}
            <View className="mt-4 mb-8">
              <Text
                className="text-gray-900 font-bold text-[18px] mb-3"

              >
                Rotas Frequentes
              </Text>
              <PlaceCard
                title="Restaurante Universitário"
                subtitle="Último deslocamento há 2 dias"
                iconType="map"
                className="mb-3"
              />
            </View>
          </ScrollView>
        </View>
      </View>

      {/* FAB - Solicitar Atendimento */}
      <FloatingActionButton onPress={() => console.log('Solicitar Atendimento')} />
    </View>
  );
}
