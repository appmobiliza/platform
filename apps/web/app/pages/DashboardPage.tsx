import { FellowRow } from "../../components/FellowRow";
import { Icon } from "../../components/Icon";
import { MetricCard } from "../../components/MetricCard";
import { ProgressRow } from "../../components/ProgressRow";
import { ServiceList } from "../../components/ServiceList";
import { Sidebar } from "../../components/Sidebar";
import { Topbar } from "../../components/Topbar";
import { fellows } from "../../components/data";

export function DashboardPage() {
  return (
    <main className="mz-app-shell">
      <Sidebar active="overview" />
      <section className="mz-workspace">
        <Topbar
          status
          subtitle="Sexta-feira, 24 de abril de 2026"
          title="Visão Geral"
        />
        <div className="mz-content">
          <div className="mz-alert">
            <Icon name="alert" />
            <span>
              Solicitação de Maria Aparecida aguarda resposta há 4 min. Nenhum
              bolsista aceitou ainda.
            </span>
          </div>

          <div className="mz-metrics-grid">
            <MetricCard
              helper="+2 em relação a ontem"
              icon="users"
              label="Atendimentos hoje"
              value="7"
            />
            <MetricCard
              helper="no turno atual"
              icon="pulse"
              label="Em andamento agora"
              value="2"
            />
            <MetricCard
              helper="+21% do último dia"
              icon="clock"
              label="Tempo de espera"
              value="~5m"
            />
            <MetricCard
              helper="no turno atual"
              icon="pulse"
              label="Bolsistas disponíveis"
              value="2 / 5"
            />
          </div>

          <div className="mz-dashboard-grid">
            <section className="mz-card mz-fellows">
              <h2>Status dos bolsistas — turno matutino</h2>
              <div>
                {fellows.map((fellow) => (
                  <FellowRow fellow={fellow} key={fellow.name} />
                ))}
              </div>
            </section>

            <div className="mz-stack">
              <section className="mz-card mz-demand">
                <h2>Demanda por horário — hoje</h2>
                <ProgressRow hour="07h" value={2} width={28} />
                <ProgressRow hour="08h" value={4} width={50} />
                <ProgressRow hour="09h" value={3} width={39} />
                <ProgressRow hour="10h" value={5} width={74} />
                <ProgressRow hour="11h" value={1} width={14} />
              </section>

              <section className="mz-card mz-routes">
                <h2>Rotas mais solicitadas</h2>
                <dl>
                  <div>
                    <dt>IC → RU</dt>
                    <dd>12x</dd>
                  </div>
                  <div>
                    <dt>Bradesco → IQB</dt>
                    <dd>3x</dd>
                  </div>
                  <div>
                    <dt>FAED → Biblioteca</dt>
                    <dd>8x</dd>
                  </div>
                  <div>
                    <dt>Lanchonete → COS</dt>
                    <dd>2x</dd>
                  </div>
                  <div>
                    <dt>RU → Reitoria</dt>
                    <dd>5x</dd>
                  </div>
                </dl>
              </section>
            </div>
          </div>

          <ServiceList />
        </div>
      </section>
    </main>
  );
}

export default DashboardPage;
