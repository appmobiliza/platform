import { View } from "react-native";

import { SettingsButton } from "@/components/settings-button";

import { useUserRole } from "@/lib/auth-store";
import { trpc } from "@/lib/trpc/client";

export default function AcademicProfile() {
	const role = useUserRole();
	const isScholar = role === "scholar";

	const { data: userData, isLoading } = trpc.profiles.me.useQuery();

	if (isLoading || !userData) {
		return (
			<View>
				<SettingsButton
					title="Curso"
					label="Carregando..."
					href="/profile/academic/course"
				/>
			</View>
		);
	}

	const profile = isScholar
		? userData.scholarProfile
		: userData.studentProfile;

	return (
		<View>
			<SettingsButton
				title="Curso"
				label={profile?.course || "Não informado"}
				href={`/profile/academic/course?course=${encodeURIComponent(profile?.course ?? "")}`}
			/>
			<SettingsButton
				title="Turno"
				label={profile?.shift || "Não informado"}
				href={`/profile/academic/shift?shift=${encodeURIComponent(profile?.shift ?? "")}`}
			/>
			<SettingsButton
				title="Campus"
				label={profile?.campus || "Não informado"}
				href={`/profile/academic/campus?campus=${encodeURIComponent(profile?.campus ?? "")}`}
			/>
			<SettingsButton
				title="Matrícula"
				label={profile?.enrollment || "Não informado"}
				className="border-none"
				href={`/profile/academic/enrollment?enrollment=${encodeURIComponent(profile?.enrollment ?? "")}`}
			/>
		</View>
	);
}
