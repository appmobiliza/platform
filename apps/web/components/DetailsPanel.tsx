import { Avatar } from "./Avatar";
import { Badge } from "./Badge";
import { Icon } from "./Icon";

export function DetailsPanel() {
  return (
    <aside className="mz-details-panel">
      <header>
        <h2>Detalhes do atendimento</h2>
        <Badge pill tone="primary">
          Em andamento
        </Badge>
      </header>
      <div className="mz-detail-content">
        <DetailUser
          detail="Deficiência visual"
          initials="MA"
          label="ALUNO"
          name="Maria Aparecida"
        />
        <DetailUser
          detail="Turno matutino"
          initials="LC"
          label="BOLSISTA"
          name="Lucas Carvalho"
        />
        <section className="mz-route-detail">
          <h3>PERCURSO</h3>
          <div>
            <Icon name="pin" />
            <span>Instituto de Computação</span>
          </div>
          <i />
          <div>
            <Icon name="pin" />
            <span>Biblioteca Central</span>
          </div>
        </section>
        <section className="mz-info-grid">
          <InfoItem label="INÍCIO" value="10h17" />
          <InfoItem label="DURAÇÃO" value="em andamento" />
          <InfoItem label="ESPERA" value="1 min 42 s" />
          <InfoItem label="DURAÇÃO" value="24/04/2026" />
        </section>
        <section className="mz-note">
          <h3>OBSERVAÇÃO</h3>
          <p>&quot;Prefere áudio descrição contínua durante o percurso.&quot;</p>
        </section>
        <section className="mz-history">
          <h3>HISTÓRICO COM ESSE ALUNO</h3>
          <p>
            <span>23/04 · RU → IC</span>
            <b>9 min</b>
          </p>
          <p>
            <span>22/04 · IC → RU</span>
            <b>11 min</b>
          </p>
          <p>
            <span>21/04 · IC → Reitoria</span>
            <b>19 min</b>
          </p>
        </section>
      </div>
    </aside>
  );
}

function DetailUser({
  label,
  initials,
  name,
  detail,
}: {
  label: string;
  initials: string;
  name: string;
  detail: string;
}) {
  return (
    <section className="mz-detail-user">
      <h3>{label}</h3>
      <div className="mz-person">
        <Avatar initials={initials} small />
        <div>
          <strong>{name}</strong>
          <span>{detail}</span>
        </div>
      </div>
    </section>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <h3>{label}</h3>
      <p>{value}</p>
    </div>
  );
}
