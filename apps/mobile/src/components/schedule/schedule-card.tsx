import { View, Text, Pressable } from "react-native"
import { PERSON_COLORS } from "./colors"
import type { ScheduleEntry } from "./types"

interface ScheduleCardProps {
  /** When null, renders an empty dashed placeholder. */
  entry: ScheduleEntry | null
  onPress?: (entry: ScheduleEntry) => void
}

/** A single grid cell: either a colored person card or an empty placeholder. */
export function ScheduleCard({ entry, onPress }: ScheduleCardProps) {
  if (!entry) {
    return (
      <View className="min-h-24 flex-1 rounded-2xl border border-dashed border-neutral-700" />
    )
  }

  const color = PERSON_COLORS[entry.person]

  return (
    <Pressable
      disabled={!onPress}
      onPress={() => onPress?.(entry)}
      className={`min-h-24 flex-1 justify-start rounded-2xl p-3 active:opacity-80 ${color.bg}`}
    >
      <Text className="text-base font-bold leading-tight text-white">
        {color.name}
      </Text>
      <Text className="mt-1 text-sm font-medium text-white/90">
        {entry.time}
      </Text>
    </Pressable>
  )
}
