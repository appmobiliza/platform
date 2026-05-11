import { Icon } from "./Icon";
import type { NavItem } from "./types";

export function SidebarItem({
  item,
  active,
  state = "default",
}: {
  item: NavItem;
  active?: boolean;
  state?: "default" | "selected" | "hover";
}) {
  const className = [
    "mz-nav-item",
    active || state === "selected" ? "mz-nav-selected" : "",
    state === "hover" ? "mz-nav-hover" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <a className={className} href={item.href}>
      <Icon name={item.icon} />
      <span>{item.label}</span>
    </a>
  );
}
