// Web fallback: localStorage (MMKV is native-only)
const PREFIX = 'mobiliza_';

function buildKey(key: string): string {
	return `${PREFIX}${key}`;
}

export const storage = {
	getString(key: string): string | undefined {
		try {
			return localStorage.getItem(buildKey(key)) ?? undefined;
		} catch {
			return undefined;
		}
	},
	set(key: string, value: string): void {
		try {
			localStorage.setItem(buildKey(key), value);
		} catch {
			// Storage may be full or unavailable
		}
	},
	delete(key: string): void {
		try {
			localStorage.removeItem(buildKey(key));
		} catch {
			// ignore
		}
	},
	clearAll(): void {
		try {
			const keysToRemove: string[] = [];
			for (let i = 0; i < localStorage.length; i++) {
				const k = localStorage.key(i);
				if (k?.startsWith(PREFIX)) {
					keysToRemove.push(k);
				}
			}
			keysToRemove.forEach((k) => {
				localStorage.removeItem(k);
			});
		} catch {
			// ignore
		}
	},
};
