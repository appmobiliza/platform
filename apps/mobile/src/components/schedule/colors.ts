/**
 * Color pool for scholars.
 *
 * Instead of a static mapping of person → color, we use a pool of visually
 * distinct colors and assign them deterministically based on the person's
 * identifier via `getPersonColor()`. This ensures the same person always
 * gets the same color without needing a server-side mapping.
 */

/** A single color entry in the pool. */
export interface PersonColor {
	bg: string;
	dot: string;
}

/**
 * Pool of visually distinct Tailwind bg-* class pairs.
 * Keep these as literal class names so Tailwind/NativeWind can extract them.
 */
const COLOR_POOL: PersonColor[] = [
	{ bg: "bg-[#C5870F]", dot: "bg-[#C5870F]" },
	{ bg: "bg-[#7FB519]", dot: "bg-[#7FB519]" },
	{ bg: "bg-[#8B3FE8]", dot: "bg-[#8B3FE8]" },
	{ bg: "bg-[#E0342A]", dot: "bg-[#E0342A]" },
	{ bg: "bg-[#176C8A]", dot: "bg-[#176C8A]" },
	{ bg: "bg-[#FF5BA0]", dot: "bg-[#FF5BA0]" },
	{ bg: "bg-[#1E97DE]", dot: "bg-[#1E97DE]" },
	{ bg: "bg-[#E8853A]", dot: "bg-[#E8853A]" },
	{ bg: "bg-[#22A699]", dot: "bg-[#22A699]" },
	{ bg: "bg-[#B83B8A]", dot: "bg-[#B83B8A]" },
];

/** Simple hash to deterministically pick a color. */
function hashCode(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash |= 0;
	}
	return Math.abs(hash);
}

/**
 * Returns a color entry for the given person identifier.
 * The same identifier always yields the same color.
 */
export function getPersonColor(person: string): PersonColor {
	const index = hashCode(person) % COLOR_POOL.length;
	return COLOR_POOL[index] as PersonColor;
}

/** Expose the pool size for external use. */
export const COLOR_POOL_SIZE = COLOR_POOL.length;
