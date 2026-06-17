import type { NewsItem } from "@/components/news-carousel";

import { storage } from "@/lib/storage";

// ─── News cache (persisted between sessions) ────────────────────────────────

const NEWS_CACHE_KEY = "news-cache";

export function getCachedNews(): NewsItem[] {
	try {
		const raw = storage.getString(NEWS_CACHE_KEY);
		if (raw) return JSON.parse(raw) as NewsItem[];
	} catch {
		// Ignore parse errors
	}
	return [];
}

export function setCachedNews(items: NewsItem[]) {
	try {
		storage.set(NEWS_CACHE_KEY, JSON.stringify(items));
	} catch {
		// Storage may be full or unavailable
	}
}
