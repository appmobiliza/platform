import { CircleAlert } from "lucide-react-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Header } from "@/components/header";
import { NacContact } from "@/components/nac-contact";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { cn } from "@/lib/utils";

interface PermissionLayoutProps {
	/** Se undefined / omitido, o Header mostra o botão de voltar padrão. */
	headerHref?: "back" | string | null;
	/** Se fornecido, substitui o comportamento do href. */
	headerOnClick?: () => void;
	/** Título da tela. */
	title: string;
	/** Conteúdo principal (descrição + botão de ação). */
	children: React.ReactNode;
	/** Substitui o NacContact padrão no rodapé. */
	footer?: React.ReactNode;
	/** Padding-top da área de conteúdo. Padrão: "pt-36". */
	paddingTop?: string;
}

/**
 * Layout compartilhado entre telas de permissão (localização, notificações, etc.)
 *
 * Fornece o Header, o ícone de alerta, o título, a área de conteúdo flexível
 * e o contato NAC no rodapé.
 */
function PermissionLayout({
	headerHref,
	headerOnClick,
	title,
	children,
	footer,
	paddingTop = "pt-36",
}: PermissionLayoutProps) {
	const insets = useSafeAreaInsets();

	return (
		<View className="flex-1" style={{ paddingBottom: insets.bottom + 16 }}>
			<Header href={headerHref} onClick={headerOnClick} />

			<View
				className={cn("flex-1 px-6 pb-8 justify-between", paddingTop)}
			>
				<View>
					<View className="mb-6">
						<Icon
							icon={CircleAlert}
							size={36}
							color="--foreground"
						/>
					</View>

					<Text className="text-3xl font-bold leading-tight mb-4">
						{title}
					</Text>

					{children}
				</View>

				{footer ?? <NacContact className="items-center" />}
			</View>
		</View>
	);
}

export type { PermissionLayoutProps };
export { PermissionLayout };
