import { Icon } from "./Icon";
import type { IconName } from "./types";

export function MetricCard({
  label,
  value,
  helper,
  icon,
  danger,
}: {
  label: string;
  value: string;
  helper?: string;
  icon?: IconName;
  danger?: boolean;
}) {
  return (
    <section className="mz-card mz-metric">
      <div className="mz-metric-heading">
        <span>{label}</span>
        {icon ? <Icon name={icon} /> : null}
      </div>
      <strong className={danger ? "mz-danger-text" : ""}>{value}</strong>
      {helper ? <p>{helper}</p> : null}
    </section>
  );
}
