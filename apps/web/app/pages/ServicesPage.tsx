import { Avatar } from "../../components/Avatar";
import { DetailsPanel } from "../../components/DetailsPanel";
import { MetricCard } from "../../components/MetricCard";
import { SelectBox } from "../../components/SelectBox";
import { Sidebar } from "../../components/Sidebar";
import { Topbar } from "../../components/Topbar";
import { serviceRows } from "../../components/data";

export function ServicesPage() {
  return (
    <main className="mz-app-shell mz-services-shell">
      <Sidebar active="services" />
      <section className="mz-workspace">
        <Topbar subtitle="Abril 2026" title="Atendimentos" />
        <div className="mz-services-content">
          <div className="mz-stats-row">
            <MetricCard label="Total no mês" value="94" />
            <MetricCard label="Tempo médio" value="~14 min" />
            <MetricCard danger label="Não atendidos" value="3" />
          </div>

          <div className="mz-filters">
            <SelectBox>Abril 2026</SelectBox>
            <SelectBox>Todos os bolsistas</SelectBox>
            <SelectBox>Todos os alunos</SelectBox>
          </div>

          <div className="mz-tabs">
            <button className="active" type="button">
              Todos
            </button>
            <button type="button">Concluídos</button>
            <button type="button">Em andamento</button>
            <button type="button">Não atendidos</button>
          </div>

          <table className="mz-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Horário</th>
                <th>Bolsista</th>
                <th>Aluno</th>
              </tr>
            </thead>
            <tbody>
              {serviceRows.map(([date, time, fellow, student]) => (
                <tr key={`${date}-${time}-${student}`}>
                  <td>{date}</td>
                  <td>{time}</td>
                  <td>
                    <span className="mz-table-person">
                      <Avatar initials="AG" small />
                      {fellow}
                    </span>
                  </td>
                  <td>{student}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <DetailsPanel />
    </main>
  );
}

export default ServicesPage;
