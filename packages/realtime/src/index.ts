import { EventEmitter } from "node:events";

export type RealtimeHandler<TPayload = unknown> = (payload: TPayload) => void | Promise<void>;

export interface RealtimeClient {
  publish(channel: string, event: string, payload: unknown): Promise<void> | void;
  subscribe(channel: string, event: string, handler: RealtimeHandler): () => void;
}

export function createInMemoryRealtime(): RealtimeClient {
  const emitter = new EventEmitter();

  return {
    async publish(channel, event, payload) {
      emitter.emit(`${channel}:${event}`, payload);
    },
    subscribe(channel, event, handler) {
      const key = `${channel}:${event}`;
      const listener = (payload: unknown) => {
        void handler(payload);
      };

      emitter.on(key, listener);

      return () => {
        emitter.off(key, listener);
      };
    },
  };
}
