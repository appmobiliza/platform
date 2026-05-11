import { Icon } from "./Icon";
import { Logo } from "./Logo";

export function MobilizaFooter() {
  return (
    <footer className="mz-footer-design">
      <div className="mz-footer-top">
        <div className="mz-footer-brand">
          <div className="mz-footer-icons">
            <Logo />
            <span className="mz-divider" />
            <span className="mz-discord">●</span>
          </div>
          <p>© 2026 Mobiliza. Feito com ❤ em Alagoas.</p>
        </div>
        <div className="mz-footer-links">
          <div>
            <h2>RECURSOS</h2>
            <a>Tutoriais</a>
            <a>Notas de Lançamento</a>
          </div>
          <div>
            <h2>AJUDA</h2>
            <a>Suporte</a>
            <a>Contato</a>
          </div>
        </div>
      </div>
      <div className="mz-footer-bottom">
        <span className="mz-status-line">
          <i /> Serviço Parcialmente Degradado ↗
        </span>
        <button className="mz-theme-button" type="button">
          ◐ Sistema <Icon name="chevron" />
        </button>
      </div>
    </footer>
  );
}
