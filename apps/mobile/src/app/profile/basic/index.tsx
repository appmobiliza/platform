import { genderLabels } from "@mobiliza/contracts";

import { View } from "react-native";

import { SettingsButton } from "@/components/settings-button";

import { useUserRole } from "@/lib/auth/store";
import { trpc } from "@/lib/trpc/client";

export default function BasicProfile() {
	const role = useUserRole();
	const isScholar = role === "scholar";

	const { data: userData, isLoading } = trpc.profiles.me.useQuery(undefined, {
		staleTime: 60_000,
	});

	if (isLoading || !userData) {
		return (
			<View>
				<SettingsButton
					title="Nome"
					label="Carregando..."
					href="/profile/basic/name"
				/>
			</View>
		);
	}

	const studentProfile = userData.studentProfile;
	const scholarProfile = userData.scholarProfile;
	const genderLabel = isScholar
		? scholarProfile?.gender
			? genderLabels[scholarProfile.gender]
			: "Não informado"
		: studentProfile?.gender
			? genderLabels[studentProfile.gender]
			: "Não informado";

	const profile = isScholar ? scholarProfile : studentProfile;
	const nickname = studentProfile?.nickname ?? "";

	return (
		<View>
			<SettingsButton
				title="Nome"
				label={userData.name || "Não informado"}
				href={`/profile/basic/name?name=${encodeURIComponent(userData.name ?? "")}&nickname=${encodeURIComponent(nickname)}`}
			/>
			<SettingsButton
				title="Gênero"
				label={genderLabel}
				href={`/profile/basic/gender?gender=${encodeURIComponent(profile?.gender ?? "")}`}
			/>
			<SettingsButton
				title="Número de telefone"
				label={profile?.phone || "Não informado"}
				href={`/profile/basic/phone?phone=${encodeURIComponent(profile?.phone ?? "")}`}
			/>
			<SettingsButton
				title="E-mail"
				label={userData.email || "Não informado"}
				href={`/profile/basic/email?email=${encodeURIComponent(userData.email ?? "")}`}
			/>
			{isScholar && (
				<SettingsButton
					title="Número do CPF"
					label={scholarProfile?.cpf || "Não informado"}
					href={`/profile/basic/cpf?cpf=${encodeURIComponent(scholarProfile?.cpf ?? "")}`}
					className="border-none"
				/>
			)}
		</View>
	);
}
