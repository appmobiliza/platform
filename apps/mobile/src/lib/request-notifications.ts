/**
 * Notificações persistentes para o fluxo de solicitação.
 *
 * Exibe uma notificação local enquanto o app está buscando contribuintes,
 * para que o estudante saiba o status mesmo com o app em segundo plano.
 */

let notificationsAvailable = false;

// Tenta carregar expo-notifications — se não estiver instalado, a feature
// funciona de forma degradada (sem notificação) sem quebrar o app.
try {
	const Notifications =
		require("expo-notifications") as typeof import("expo-notifications");
	if (Notifications?.setNotificationHandler) {
		Notifications.setNotificationHandler({
			handleNotification: async () => ({
				shouldShowAlert: true,
				shouldPlaySound: false,
				shouldSetBadge: false,
				shouldShowBanner: true,
				shouldShowList: true,
			}),
		});
		notificationsAvailable = true;
	}
} catch {
	// expo-notifications não está instalado
}

let permissionRequested = false;

async function ensurePermission(): Promise<boolean> {
	if (!notificationsAvailable) return false;
	if (permissionRequested) return true;

	try {
		const Notifications = require("expo-notifications");
		const { status } =
			await Notifications.requestPermissionsAsync();
		if (status !== "granted") {
			console.warn(
				"[notifications] Permissão não concedida para notificações.",
			);
			return false;
		}
		permissionRequested = true;
		return true;
	} catch {
		return false;
	}
}

let currentNotificationId: string | null = null;

/**
 * Mostra uma notificação persistente informando que o app está
 * procurando um contribuinte.
 */
export async function showSearchingNotification(): Promise<void> {
	if (!notificationsAvailable) return;

	await cancelNotification();

	const hasPermission = await ensurePermission();
	if (!hasPermission) return;

	try {
		const Notifications = require("expo-notifications");

		const id = await Notifications.scheduleNotificationAsync({
			content: {
				title: "Procurando contribuinte",
				body: "Aguardando um contribuinte aceitar sua solicitação de deslocamento.",
				data: { type: "searching" },
				autoDismiss: false,
			},
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
	if (!notificationsAvailable) return;

	const hasPermission = await ensurePermission();
	if (!hasPermission) return;

	try {
		const Notifications = require("expo-notifications");
		await cancelNotification();

		await Notifications.scheduleNotificationAsync({
			content: {
				title: "Solicitação aceita!",
				body: "Um contribuinte aceitou sua solicitação. Vá até o ponto de partida.",
				data: { type: "accepted" },
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
	if (!notificationsAvailable) return;

	const hasPermission = await ensurePermission();
	if (!hasPermission) return;

	try {
		const Notifications = require("expo-notifications");
		await cancelNotification();

		await Notifications.scheduleNotificationAsync({
			content: {
				title: "Nenhum contribuinte encontrado",
				body: "Sua solicitação não foi atendida no tempo esperado. Tente novamente mais tarde.",
				data: { type: "unattended" },
			},
			trigger: null,
		});
	} catch {
		// Ignore
	}
}

/**
 * Cancela a notificação atual, se houver.
 */
export async function cancelNotification(): Promise<void> {
	if (!notificationsAvailable || !currentNotificationId) return;

	try {
		const Notifications = require("expo-notifications");
		await Notifications.cancelScheduledNotificationAsync(
			currentNotificationId,
		);
		currentNotificationId = null;
	} catch {
		// Ignore
	}
}

/**
 * Cancela todas as notificações agendadas pelo app.
 */
export async function cancelAllNotifications(): Promise<void> {
	if (!notificationsAvailable) return;

	try {
		const Notifications = require("expo-notifications");
		await Notifications.cancelAllScheduledNotificationsAsync();
		currentNotificationId = null;
	} catch {
		// Ignore
	}
}
