import { Sidebar } from "../../components/Sidebar";
import { Topbar } from "../../components/Topbar";
import type { SidebarKey } from "../../components/types";

export function EmptyPage({
  active,
  title,
}: {
  active: SidebarKey;
  title: string;
}) {
  return (
    <main className="mz-app-shell">
      <Sidebar active={active} />
      <section className="mz-workspace">
        <Topbar showExport={false} title={title} />
        <div className="mz-empty-page" />
      </section>
    </main>
  );
}
