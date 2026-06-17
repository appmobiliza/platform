/**
 * Color pool for scholars.
 *
 * Instead of a static mapping of person → color, we use a pool of visually
 * distinct colors and assign them deterministically based on the person's
 * identifier. Colors are assigned to ensure no two people in the same view
 * share the same color (up to the pool size).
 */

/** A single color entry in the pool. */
export interface PersonColor {
	bg: string;
	dot: string;
}

/**
 * Pool of visually distinct Tailwind bg-* class pairs.
 * Keep these as literal class names so Tailwind can extract them.
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

/**
 * Build a deterministic color map for a set of people.
 * People are sorted alphabetically first, then colors are assigned
 * round-robin from the pool. This guarantees unique colors for up to
 * `COLOR_POOL.length` people in the set.
 */
export function buildColorMap(people: string[]): Map<string, PersonColor> {
	const sorted = [...people].sort();
	const map = new Map<string, PersonColor>();
	for (let i = 0; i < sorted.length; i++) {
		map.set(sorted[i] as string, COLOR_POOL[i % COLOR_POOL.length] as PersonColor);
	}
	return map;
}

/**
 * Returns a color entry for the given person identifier.
 * Prefer passing a color map from `buildColorMap()` to guarantee unique
 * colors within a view. Falls back to a hash-based pick when no map is
 * available.
 */
export function getPersonColor(
	person: string,
	colorMap?: Map<string, PersonColor>,
): PersonColor {
	if (colorMap) {
		return colorMap.get(person) ?? COLOR_POOL[0] as PersonColor;
	}
	// Legacy fallback — simple hash to deterministically pick a color.
	let hash = 0;
	for (let i = 0; i < person.length; i++) {
		const char = person.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash |= 0;
	}
	const index = Math.abs(hash) % COLOR_POOL.length;
	return COLOR_POOL[index] as PersonColor;
}

/** Expose the pool size for external use. */
export const COLOR_POOL_SIZE = COLOR_POOL.length;
