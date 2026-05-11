import { Avatar } from "./Avatar";
import { navItems } from "./data";
import { Logo } from "./Logo";
import { SidebarItem } from "./SidebarItem";
import type { SidebarKey } from "./types";

export function Sidebar({ active }: { active: SidebarKey }) {
  return (
    <aside className="mz-sidebar">
      <header className="mz-sidebar-header">
        <Logo />
        <p>Painel NAC</p>
      </header>
      <nav className="mz-nav">
        {navItems.map((item) => (
          <SidebarItem active={item.key === active} item={item} key={item.key} />
        ))}
      </nav>
      <footer className="mz-profile">
        <Avatar initials="AG" tone="primary" />
        <div>
          <strong>Adriana G.</strong>
          <span>Administrador</span>
        </div>
      </footer>
    </aside>
  );
}
