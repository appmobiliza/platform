/**
 * Notificações locais para o fluxo de solicitação.
 *
 * Gerencia o ciclo de vida das notificações: permissão, categorias (com
 * ação "Cancelar" para a busca), exibição e cancelamento.
 *
 * A notificação de busca (searching) fica visível mesmo com o app fechado
 * e inclui um botão "Cancelar" para que o estudante cancele a solicitação
 * diretamente pela notificação.
 */

import * as Notifications from "expo-notifications";

// ─── Category & Action identifiers ─────────────────────────────────────────

const SEARCHING_CATEGORY_ID = "searching";

/** Identificador da ação "Cancelar" na notificação de busca. */
export const ACTION_CANCEL = "CANCEL";

// ─── Module state ──────────────────────────────────────────────────────────

let isInitialized = false;
let currentNotificationId: string | null = null;

// ─── Initialization ─────────────────────────────────────────────────────────

/**
 * Inicializa o módulo de notificações (handler + categorias).
 *
 * Deve ser chamado uma vez no início do app (ex.: RootLayout).
 */
export async function initializeNotifications(): Promise<void> {
	if (isInitialized) return;
	isInitialized = true;

	Notifications.setNotificationHandler({
		handleNotification: async () => ({
			shouldShowAlert: true,
			shouldPlaySound: false,
			shouldSetBadge: false,
			shouldShowBanner: true,
			shouldShowList: true,
		}),
	});

	try {
		await Notifications.setNotificationCategoryAsync(
			SEARCHING_CATEGORY_ID,
			[
				{
					identifier: ACTION_CANCEL,
					buttonTitle: "Cancelar",
					options: {
						opensAppToForeground: false,
					},
				},
			],
		);
	} catch (error) {
		console.error(
			"[notifications] Failed to set up categories:",
			error,
		);
	}
}

// ─── Permission ─────────────────────────────────────────────────────────────

/** Solicita permissão de notificações. Retorna true se concedida. */
export async function requestPermission(): Promise<boolean> {
	try {
		const { status } =
			await Notifications.requestPermissionsAsync();
		return status === "granted";
	} catch {
		return false;
	}
}

/** Retorna o status atual da permissão de notificações. */
export async function getPermissionStatus(): Promise<Notifications.PermissionStatus> {
	try {
		const { status } = await Notifications.getPermissionsAsync();
		return status;
	} catch {
		return "denied" as Notifications.PermissionStatus;
	}
}

// ─── Notifications ──────────────────────────────────────────────────────────

/**
 * Mostra uma notificação persistente (não dispensável) informando que o app
 * está procurando um contribuinte.
 *
 * Inclui um botão "Cancelar" que permite ao estudante cancelar a solicitação
 * diretamente pela notificação.
 *
 * @param requestId ID da solicitação para a ação de cancelamento.
 */
export async function showSearchingNotification(
	requestId?: string,
): Promise<void> {
	await initializeNotifications();
	await cancelCurrentNotification();

	const hasPermission = await requestPermission();
	if (!hasPermission) return;

	try {
		const id = await Notifications.scheduleNotificationAsync({
			content: {
				title: "Procurando contribuinte",
				body: "Aguardando um contribuinte aceitar sua solicitação de deslocamento.",
				data: { type: "searching", requestId },
				autoDismiss: false,
				categoryId: SEARCHING_CATEGORY_ID,
			} as Notifications.NotificationContentInput & { categoryId: string },
			trigger: null,
		});
		currentNotificationId = id;
	} catch {
		// Ignore notification errors
	}
}

/**
 * Atualiza a notificação para informar que a solicitação foi aceita.
 */
export async function showAcceptedNotification(): Promise<void> {
	await cancelCurrentNotification();

	try {
		await Notifications.scheduleNotificationAsync({
			content: {
				title: "Solicitação aceita!",
				body: "Um contribuinte aceitou sua solicitação. Vá até o ponto de partida.",
				data: { type: "accepted" },
				autoDismiss: true,
			},
			trigger: null,
		});
	} catch {
		// Ignore
	}
}

/**
 * Notifica que a solicitação não foi atendida (timeout).
 */
export async function showUnattendedNotification(): Promise<void> {
	await cancelCurrentNotification();

	try {
		await Notifications.scheduleNotificationAsync({
			content: {
				title: "Nenhum contribuinte encontrado",
				body: "Sua solicitação não foi atendida no tempo esperado. Tente novamente mais tarde.",
				data: { type: "unattended" },
				autoDismiss: true,
			},
			trigger: null,
		});
	} catch {
		// Ignore
	}
}

/** Cancela apenas a notificação de busca atual, se houver. */
async function cancelCurrentNotification(): Promise<void> {
	if (!currentNotificationId) return;
	try {
		await Notifications.cancelScheduledNotificationAsync(
			currentNotificationId,
		);
		currentNotificationId = null;
	} catch {
		// Ignore
	}
}

/** Cancela todas as notificações agendadas pelo app. */
export async function cancelAllNotifications(): Promise<void> {
	try {
		await Notifications.cancelAllScheduledNotificationsAsync();
		currentNotificationId = null;
	} catch {
		// Ignore
	}
}
