import { useRouter } from "expo-router";

import { PermissionLayout } from "@/components/permission-layout";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { authClient } from "@/lib/auth/client";
import { clearUserCache } from "@/lib/auth/store";

export default function Unregistered() {
	const router = useRouter();

	return (
		<PermissionLayout
			headerOnClick={async () => {
				await authClient.signOut();
				clearUserCache();
			}}
			title="Parece que você ainda não está cadastrado no Mobiliza"
			paddingTop="pt-24"
		>
			<Text className="text-base leading-relaxed">
				Para solicitar atendimentos, você precisa estar cadastrado no
				programa.
			</Text>

			<Button
				className="mt-8"
				onPress={() => router.push("/onboarding/basic")}
			>
				<Text>Realizar cadastro</Text>
			</Button>
		</PermissionLayout>
	);
}
