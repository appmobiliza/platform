import { Badge } from "./Badge";

export function Topbar({
  title,
  subtitle,
  status,
  showExport = true,
}: {
  title: string;
  subtitle?: string;
  status?: boolean;
  showExport?: boolean;
}) {
  return (
    <header className="mz-topbar">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <div className="mz-topbar-actions">
        {status ? (
          <Badge pill tone="success">
            <span className="mz-dot" /> Sistema ativo
          </Badge>
        ) : null}
        {showExport ? (
          <button className="mz-button" type="button">
            Exportar CSV
          </button>
        ) : null}
      </div>
    </header>
  );
}
