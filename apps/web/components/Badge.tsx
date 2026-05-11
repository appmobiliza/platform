import type { ReactNode } from "react";
import type { Tone } from "./types";

export function Badge({
  children,
  tone = "neutral",
  pill = false,
}: {
  children: ReactNode;
  tone?: Tone | string;
  pill?: boolean;
}) {
  return (
    <span className={`mz-badge mz-badge-${tone} ${pill ? "mz-pill" : ""}`}>
      {children}
    </span>
  );
}
