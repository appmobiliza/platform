import { TabList, TabSlot, Tabs, TabTrigger } from "expo-router/ui";
import { Home, Map as MapIcon, User } from "lucide-react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

export default function AppTabs() {
	return (
		<Tabs className="flex h-screen min-h-0 flex-col bg-background overflow-y-scroll">
			<TabSlot className="flex-1 min-h-0 pb-28" />
			<TabList className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-1rem)] max-w-md -translate-x-1/2 flex-row items-center rounded-2xl border border-border/60 bg-background/95 px-2 py-2 shadow-lg backdrop-blur supports-backdrop-filter:bg-background/80">
				<TabTrigger
					name="index"
					href="/"
					className="flex-1 items-center justify-center gap-1 rounded-xl py-2 data-[state=active]:bg-muted text-muted-foreground flex-col"
				>
					<Icon icon={Home} size={18} />
					<Text>Início</Text>
				</TabTrigger>
				<TabTrigger
					name="history"
					href="/history"
					className="flex-1 items-center justify-center gap-1 rounded-xl py-2 data-[state=active]:bg-muted text-muted-foreground flex-col"
				>
					<Icon icon={MapIcon} size={18} />
					<Text>Histórico</Text>
				</TabTrigger>
				<TabTrigger
					name="profile"
					href="/profile"
					className="flex-1 items-center justify-center gap-1 rounded-xl py-2 data-[state=active]:bg-muted text-muted-foreground flex-col"
				>
					<Icon icon={User} size={18} />
					<Text>Perfil</Text>
				</TabTrigger>
			</TabList>
		</Tabs>
	);
}
