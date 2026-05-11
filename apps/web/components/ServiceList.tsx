import { Badge } from "./Badge";
import { latestServices } from "./data";

export function ServiceList() {
  return (
    <section className="mz-card mz-latest">
      <div className="mz-card-header">
        <h2>Últimos atendimentos</h2>
        <a className="mz-button mz-button-sm" href="/services">
          Ver todos
        </a>
      </div>
      <div>
        {latestServices.map((item) => (
          <div className="mz-service-item" key={item.title}>
            <span className="mz-status-dot" />
            <div>
              <strong>{item.title}</strong>
              <p>{item.meta}</p>
            </div>
            <Badge tone={item.tone}>{item.status}</Badge>
          </div>
        ))}
      </div>
    </section>
  );
}
