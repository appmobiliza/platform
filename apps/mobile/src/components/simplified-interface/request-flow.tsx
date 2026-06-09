import { Info } from "lucide-react-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddressRoute } from "../address";
import { SearchIndicator } from "../request-flow-sheet/subcomponents/seach-indicator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { Text } from "../ui/text";

export interface AcessibleRequestStep {
	subtitle?: string;
	title: string;
	note: string | React.ReactNode;
	children: React.ReactNode;
}

export function FlowStep({
	title,
	note,
	children,
	subtitle,
}: AcessibleRequestStep) {
	const insets = useSafeAreaInsets();

	return (
		<View
			className="bg-primary pb-16 px-4 flex justify-center items-center mb-8"
			style={{
				paddingTop: insets.top + 64,
			}}
		>
			{subtitle && (
				<Text className="text-primary-foreground font-semibold text-lg mb-1">
					{subtitle}
				</Text>
			)}
			<Text className="text-primary-foreground text-4xl mb-4">
				{title}
			</Text>
			<View className="flex flex-row items-center justify-start">
				<Icon icon={Info} color="--foreground" size={20} />
				<Text className="text-foreground text-base mb-4 flex-1">
					{note}
				</Text>
			</View>
			{children}
		</View>
	);
}

const Step1: AcessibleRequestStep = {
	subtitle: "Estamos ouvindo seu pedido",
	title: "Diga para onde deseja ir",
	note: "Para voltar à página inicial, fique em silêncio ou diga “cancelar” ",
	children: (
		<>
			{/* Audio Reactive Microphone */}
			<View></View>
			<View className="bg-card border border-border rounded-lg">
				<Text className="text-sm font-semibold text-muted-foreground">
					Transcrição
				</Text>
				<Text>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit.
					Curabitur molestie risus id massa tristique, id sagittis
					diam blandit. Praesent volutpat dui sit amet massa ultricies
					cursus. In turpis odio, mattis sit amet ipsum eu, mollis
					viverra eros. Nunc et scelerisque lacus, nec tempus ipsum.
				</Text>
			</View>
		</>
	),
};

const Step2: AcessibleRequestStep = {
	subtitle: "Confirma pra gente:",
	title: "Você deseja ir de RU para Biblioteca Central?",
	note: "Selecione o botão abaixo de 'sim' ou 'não' para confirmar sua escolha.",
	children: (
		<>
			<Button className="text-2xl font-medium py-4 px-8">
				<Text>Sim, quero enviar</Text>
			</Button>
			<Button
				className="text-2xl font-medium py-4 px-8"
				variant={"destructive"}
			>
				<Text>Não, quero cancelar</Text>
			</Button>
		</>
	),
};

const Step3: AcessibleRequestStep = {
	subtitle: "Por favor, aguarde",
	title: "Procurando contribuintes...",
	note: "Para voltar à página inicial, selecione o botão 'cancelar solicitação' abaixo",
	children: (
		<>
			<SearchIndicator />

			<AddressRoute
				className="bg-input p-4 rounded-lg gap-4"
				from={{
					label: origin?.abbreviation ?? origin?.name ?? "",
				}}
				to={{ label: destination?.name ?? "" }}
			/>

			<Button
				className="text-2xl font-medium py-4 px-8"
				variant={"destructive"}
			>
				<Text>Cancelar solicitação</Text>
			</Button>
		</>
	),
};

const Step4: AcessibleRequestStep = {
	subtitle: "Bolsista encontrado!",
	title: "Você será atendido por",
	note: (
		<View className="flex-row items-start gap-4">
			<Avatar alt="Avatar do contribuinte" className="size-12">
				{scholarInfo?.image ? (
					<AvatarImage
						source={{
							uri: scholarInfo.image,
						}}
					/>
				) : null}
				<AvatarFallback>
					<Text>
						{scholarInfo?.name
							?.split(" ")
							.map((n) => n[0])
							.join("")
							.slice(0, 2)
							.toUpperCase() ?? ""}
					</Text>
				</AvatarFallback>
			</Avatar>
			<View className="flex-1 gap-0.5">
				<View className="flex-row items-center justify-between gap-3">
					<Text className="text-[16px] font-semibold leading-6 text-foreground">
						{scholarInfo?.name ?? "Contribuinte"}
					</Text>
				</View>
			</View>
		</View>
	),
	children: (
		<>
			<View className="flex flex-row items-center justify-center gap-9">
				<View className="bg-primary rounded-sm">
					<Text className="text-4xl font-semibold text-primary-foreground">
						2<Text className="font-normal text-2xl">min</Text>
					</Text>
				</View>
				<View className="bg-primary rounded-sm">
					<Text className="text-4xl font-semibold text-primary-foreground">
						~500m
					</Text>
				</View>
			</View>

			<AddressRoute
				className="bg-input p-4 rounded-lg gap-4"
				from={{
					label: origin?.abbreviation ?? origin?.name ?? "",
				}}
				to={{ label: destination?.name ?? "" }}
			/>
		</>
	),
};

const Step5: AcessibleRequestStep = {
	subtitle: "Em trajeto para",
	title: "Biblioteca Central",
	children: (
		<>
			<View className="flex-row items-start gap-4">
				<Avatar alt="Avatar do contribuinte" className="size-12">
					{scholarInfo?.image ? (
						<AvatarImage
							source={{
								uri: scholarInfo.image,
							}}
						/>
					) : null}
					<AvatarFallback>
						<Text>
							{scholarInfo?.name
								?.split(" ")
								.map((n) => n[0])
								.join("")
								.slice(0, 2)
								.toUpperCase() ?? ""}
						</Text>
					</AvatarFallback>
				</Avatar>
				<View className="flex-1 gap-0.5">
					<View className="flex-row items-center justify-between gap-3">
						<Text className="text-[16px] font-semibold leading-6 text-foreground">
							{scholarInfo?.name ?? "Contribuinte"}
						</Text>
					</View>
				</View>
			</View>

			<AddressRoute
				className="bg-input p-4 rounded-lg gap-4"
				from={{
					label: origin?.abbreviation ?? origin?.name ?? "",
				}}
				to={{ label: destination?.name ?? "" }}
			/>

			<View className="w-full flex flex-col items-center justify-center gap-3 bg-input">
				<Text className="text-muted-foreground text-xl font-medium">
					Início
				</Text>
				<Text className="font-semibold text-2xl">10h17</Text>
			</View>

			<View className="w-full flex flex-col items-center justify-center gap-3 bg-input">
				<Text className="text-muted-foreground text-xl font-medium">
					Distância restante
				</Text>
				<Text className="font-semibold text-2xl">2,1km</Text>
			</View>
		</>
	),
};
