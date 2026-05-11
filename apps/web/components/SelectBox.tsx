import type { ReactNode } from "react";
import { Icon } from "./Icon";

export function SelectBox({ children }: { children: ReactNode }) {
  return (
    <button className="mz-select" type="button">
      <span>{children}</span>
      <Icon name="chevron" />
    </button>
  );
}
