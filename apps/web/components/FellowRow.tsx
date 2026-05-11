import { Avatar } from "./Avatar";
import { Badge } from "./Badge";
import type { fellows } from "./data";

export function FellowRow({ fellow }: { fellow: (typeof fellows)[number] }) {
  return (
    <div className="mz-person-row">
      <div className="mz-person">
        <Avatar initials={fellow.initials} tone={fellow.avatar} />
        <div>
          <strong>{fellow.name}</strong>
          <span>{fellow.detail}</span>
        </div>
      </div>
      <Badge tone={fellow.tone}>{fellow.status}</Badge>
    </div>
  );
}
