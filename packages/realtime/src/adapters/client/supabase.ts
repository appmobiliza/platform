import { createClient } from "@supabase/supabase-js";

import type {
	RealtimeClientAdapter,
	RealtimePayload,
	SupabaseAdapterOptions,
	Unsubscribe,
} from "../../types";

type SupabaseClient = import("@supabase/supabase-js").SupabaseClient;
type RealtimeChannel = import("@supabase/supabase-js").RealtimeChannel;

/**
 * Adaptador **client-side** para o Supabase Realtime.
 *
 * Usado no React Native e no Next.js para receber e enviar eventos
 * em tempo real sem depender de um SDK específico.
 *
 * O publish client-side é usado exclusivamente para eventos leves e
 * não-críticos como atualização de posição geográfica.
 *
 * @example
 * ```ts
 * const adapter = new SupabaseClientAdapter({ url, anonKey })
 *
 * useEffect(() => {
 *   const unsub = adapter.subscribe('sala:42', 'voto:registrado', (data) => {
 *     setVotos(prev => [...prev, data])
 *   })
 *   return unsub
 * }, [])
 * ```
 */
export class SupabaseClientAdapter implements RealtimeClientAdapter {
	private client: SupabaseClient;
	private channels = new Map<string, RealtimeChannel>();

	constructor(options: SupabaseAdapterOptions) {
		this.client = createClient(options.url, options.anonKey);
	}

	async publish(
		channel: string,
		event: string,
		data: RealtimePayload,
	): Promise<void> {
		try {
			const ch = this.ensureChannel(channel);
			const result = await ch.send({
				type: "broadcast",
				event,
				payload: data,
			});
			if (result !== "ok") {
				console.warn(
					`[SupabaseClientAdapter] Publish to ${channel}/${event}: ${result}`,
				);
			}
		} catch (error) {
			console.error(
				`[SupabaseClientAdapter] Failed to publish to ${channel}/${event}:`,
				error,
			);
		}
	}

	private ensureChannel(channel: string): RealtimeChannel {
		if (!this.channels.has(channel)) {
			const ch = this.client.channel(channel, {
				config: { broadcast: { self: true } },
			});
			ch.subscribe();
			this.channels.set(channel, ch);
		}
		return this.channels.get(channel)!;
	}

	subscribe(
		channel: string,
		event: string,
		handler: (data: RealtimePayload) => void,
	): Unsubscribe {
		const ch = this.ensureChannel(channel);

		ch.on("broadcast", { event }, ({ payload }) => {
			handler(payload as RealtimePayload);
		}).subscribe();

		return () => {
			ch.unsubscribe();
			this.channels.delete(channel);
		};
	}

	disconnect(): void {
		this.channels.forEach((ch) => {
			this.client.removeChannel(ch);
		});
		this.channels.clear();
	}
}
