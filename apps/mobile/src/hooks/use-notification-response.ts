/**
 * Hook que gerencia o toque em notificações locais.
 *
 * - **Ação "Cancelar"**: cancela a solicitação no backend e limpa o estado.
 * - **Toque padrão** (notificação de busca/aceita): navega para a tela de
 *   solicitação (/request) para que o fluxo seja restaurado.
 *
 * Deve ser usado no componente raiz do app (RootLayout).
 */

import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect } from "react";

import { ACTION_CANCEL, cancelAllNotifications } from "@/lib/notifications";
import { trpcClient } from "@/lib/trpc/client";

import { clearRequestState } from "@/stores/request-store";

export function useNotificationResponse() {
	const router = useRouter();

	useEffect(() => {
		function handleResponse(
			response: Notifications.NotificationResponse,
		) {
			const data = response.notification.request.content.data as
				| {
					type?: string;
					requestId?: string;
				}
				| undefined;

			const actionId = response.actionIdentifier;

			// ── Ação "Cancelar" ──
			if (actionId === ACTION_CANCEL && data?.requestId) {
				handleCancelAction(data.requestId);
				return;
			}

			// ── Toque padrão → navega para a tela de solicitação ──
			if (actionId === Notifications.DEFAULT_ACTION_IDENTIFIER) {
				if (
					data?.type === "searching" ||
					data?.type === "accepted"
				) {
					router.replace("/request");
				}
			}
		}

		function handleCancelAction(requestId: string) {
			trpcClient.requests.cancel
				.mutate({ requestId })
				.then(() => {
					clearRequestState();
					cancelAllNotifications();
				})
				.catch((err) => {
					console.error(
						"[notifications] Failed to cancel request from notification:",
						err,
					);
				});
		}

		// ── Cold-start: verifica se o app foi aberto por uma notificação ──
		Notifications.getLastNotificationResponseAsync()
			.then((response) => {
				if (response) {
					handleResponse(response);
				}
			})
			.catch(() => {
				// Ignora erros de leitura
			});

		// ── Toques enquanto o app está em foreground/background ──
		const subscription =
			Notifications.addNotificationResponseReceivedListener(
				(response) => {
					handleResponse(response);
				},
			);

		return () => {
			subscription.remove();
		};
	}, [router]);
}
