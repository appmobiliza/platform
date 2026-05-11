import { Avatar } from "../../components/Avatar";
import { MobilizaFooter } from "../../components/MobilizaFooter";
import { SidebarItem } from "../../components/SidebarItem";
import { navItems } from "../../components/data";

export function ComponentsPage() {
  const [sample] = navItems;

  if (!sample) {
    return null;
  }

  return (
    <main className="mz-gallery">
      <MobilizaFooter />
      <section className="mz-component-card">
        <h1>Componentes Figma</h1>
        <div className="mz-sidebar-item-demo">
          <SidebarItem item={sample} state="default" />
          <SidebarItem item={sample} state="selected" />
          <SidebarItem item={sample} state="hover" />
        </div>
        <div className="mz-avatar-demo">
          <Avatar initials="AG" />
          <span>Placeholder 48px</span>
        </div>
      </section>
    </main>
  );
}

export default ComponentsPage;
