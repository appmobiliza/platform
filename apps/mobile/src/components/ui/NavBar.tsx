import { View, Text, TouchableOpacity, Platform } from "react-native";
import { Home, Map, User } from "lucide-react-native";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "../../utils/cn";

interface NavBarProps {
  // Can be passed via Expo Router Tabs or used manually
  className?: string;
}

export const NavBar = ({ className }: NavBarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const TABS = [
    {
      name: "Início",
      icon: Home,
      route: "/estudante/home",
      isActive: pathname === "/estudante/home",
    },
    {
      name: "Histórico",
      icon: Map,
      route: "/estudante/history",
      isActive: pathname.startsWith("/estudante/history"),
    },
    {
      name: "Perfil",
      icon: User,
      route: "/estudante/profile",
      isActive: pathname === "/estudante/profile",
    },
  ];

  return (
    <View
      className={cn(
        "flex-row items-center justify-between bg-white px-8 pt-4 pb-2 shadow-sm",
        "rounded-t-[32px] border-t border-gray-100",
        className
      )}
      style={{
        paddingBottom: Math.max(insets.bottom, Platform.OS === "ios" ? 20 : 16),
      }}
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const color = tab.isActive ? "#00635D" : "#9CA3AF"; // brand-primary vs gray-400

        return (
          <TouchableOpacity
            key={tab.name}
            accessibilityLabel={tab.name}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab.isActive }}
            activeOpacity={0.7}
            onPress={() => router.push(tab.route as any)}
            className="items-center justify-center gap-1"
          >
            <View
              className={cn(
                "p-2 rounded-2xl",
                tab.isActive && "bg-brand-primary/10"
              )}
            >
              <Icon size={24} color={color} strokeWidth={tab.isActive ? 2.5 : 2} />
            </View>
            <Text
              className={cn(
                "text-xs",
                tab.isActive ? "font-semibold text-brand-primary" : "text-gray-400"
              )}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
