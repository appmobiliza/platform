// Web fallback: in-memory storage (MMKV is native-only)
const webStore = new Map<string, string>();

export const storage = {
	getString(key: string): string | undefined {
		return webStore.get(key);
	},
	set(key: string, value: string): void {
		webStore.set(key, value);
	},
	delete(key: string): void {
		webStore.delete(key);
	},
	clearAll(): void {
		webStore.clear();
	},
};
