import type { PersonId } from "./types"

/**
 * Static class strings per person so NativeWind can statically extract them.
 * Do NOT build these class names dynamically (e.g. `bg-[${hex}]`) — keep them literal.
 */
export const PERSON_COLORS: Record<
  PersonId,
  { name: string; bg: string; dot: string }
> = {
  ediluze: { name: "Ediluze", bg: "bg-[#C5870F]", dot: "bg-[#C5870F]" },
  janderson: { name: "Janderson", bg: "bg-[#7FB519]", dot: "bg-[#7FB519]" },
  carlos: { name: "Carlos", bg: "bg-[#8B3FE8]", dot: "bg-[#8B3FE8]" },
  miguel: { name: "Miguel", bg: "bg-[#E0342A]", dot: "bg-[#E0342A]" },
  eduarda: { name: "Eduarda", bg: "bg-[#176C8A]", dot: "bg-[#176C8A]" },
  amanda: { name: "Amanda", bg: "bg-[#FF5BA0]", dot: "bg-[#FF5BA0]" },
  paula: { name: "Paula", bg: "bg-[#1E97DE]", dot: "bg-[#1E97DE]" },
}

/** Order used to render the legend. */
export const LEGEND_ORDER: PersonId[] = [
  "ediluze",
  "janderson",
  "carlos",
  "miguel",
  "eduarda",
  "amanda",
  "paula",
]
