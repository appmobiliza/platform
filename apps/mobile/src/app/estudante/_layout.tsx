import { Tabs } from "expo-router";
import { NavBar } from "../../components/ui/NavBar";

export default function EstudanteLayout() {
  return (
    <Tabs
      tabBar={() => <NavBar />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Início",
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Histórico",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
        }}
      />
    </Tabs>
  );
}
