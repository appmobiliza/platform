# ROADMAP.md — Projeto Mobiliza

## Visão Geral do Roadmap

O Mobiliza será desenvolvido em **4 Sprints** ao longo do semestre 2026.1, com entrega final em julho. A priorização follows **MoSCoW**: Must have → Should have → Nice to have.

**Horizontes:**
- **Sprint 1-2 (Maio):** Foundation + Core flow (autenticação + solicitação + registro)
- **Sprint 3 (Junho):** Availability management + Dashboard + Accessibility
- **Sprint 4 (Julho):** Polish + Reports + Nice-to-have features

---

## EP-01 · Autenticação e Perfis

**Descrição:** Sistema de login institucional e gerenciamento de perfis diferenciados para alunos PcD, bolsistas e gestores.

| ID | User Story | Sprint | Prioridade |
|----|------------|--------|-------------|
| AUTH-01 | Login institucional via e-mail @laccan.ufal.br / @ic.ufal.br | 1 | Must |
| AUTH-02 | Perfil do aluno com deficiência (tipo, preferências, observações) | 1 | Must |
| AUTH-03 | Perfil do bolsista (turno, aprovação NAC) | 1 | Must |

**Dependências:** nenhuma (foundation)
**Entrega:** Sprint 1

---

## EP-02 · Solicitação de Atendimento

**Descrição:** Fluxo completo de solicitação privada de deslocamento, do aluno até a conclusão do atendimento.

| ID | User Story | Sprint | Prioridade |
|----|------------|--------|-------------|
| REQ-01 | Solicitar deslocamento (origem → destino, observações opcionais) | 1 | Must |
| REQ-02 | Aceitar solicitação de atendimento (bolsista) | 1 | Must |
| REQ-03 | Acompanhar status do atendimento em tempo real | 1 | Must |
| REQ-04 | Rotas frequentes salvas | 4 | Nice |

**Dependências:** EP-01 (autenticação)
**Entrega:** Sprint 1 (REQ-01 a REQ-03), Sprint 4 (REQ-04)

---

## EP-03 · Gestão de Disponibilidade dos Bolsistas

**Descrição:** Sistema de toggle de disponibilidade e notificações para situações sem bolsistas disponíveis.

| ID | User Story | Sprint | Prioridade |
|----|------------|--------|-------------|
| AVAIL-01 | Marcar disponibilidade por turno (toggle disponível/indisponível) | 3 | Should |
| AVAIL-02 | Notificar gestor quando solicitação ficar sem resposta | 3 | Should |

**Dependências:** EP-01 + EP-02
**Entrega:** Sprint 3

---

## EP-04 · Registro Automático de Atendimentos

**Descrição:** Captura automática de dados no momento da conclusão do atendimento, eliminando preenchimento manual de planilhas.

| ID | User Story | Sprint | Prioridade |
|----|------------|--------|-------------|
| ATT-01 | Registro automático ao concluir atendimento | 1 | Must |
| ATT-02 | Histórico de atendimentos do bolsista | 4 | Nice |

**Dependências:** EP-02 (fluxo de conclusão)
**Entrega:** Sprint 1 (ATT-01), Sprint 4 (ATT-02)

---

## EP-05 · Dashboard de Gestão (Web)

**Descrição:** Painel web para coordenação NAC com visão em tempo real, histórico e relatórios.

| ID | User Story | Sprint | Prioridade |
|----|------------|--------|-------------|
| DASH-01 | Visão geral em tempo real (atendimentos ativos, bolsistas, pendências) | 3 | Should |
| DASH-02 | Relatórios exportáveis (CSV/PDF) | 3 | Should |
| DASH-03 | Gestão de cadastros de bolsistas | 4 | Nice |

**Dependências:** EP-04 (dados de registros)
**Entrega:** Sprint 3 (DASH-01, DASH-02), Sprint 4 (DASH-03)

---

## EP-06 · Acessibilidade e Experiência do Usuário

**Descrição:** Interface compatível com leitores de tela e comunicação por áudio para alunos com deficiência visual.

| ID | User Story | Sprint | Prioridade |
|----|------------|--------|-------------|
| A11Y-01 | Interface compatível com TalkBack / VoiceOver | 3 | Should |
| A11Y-02 | Comunicação por áudio (TTS) para status e notificações | 4 | Nice |

**Dependências:** EP-02 (telas do app)
**Entrega:** Sprint 3 (A11Y-01), Sprint 4 (A11Y-02)

---

## EP-07 · Infraestrutura e Setup

**Descrição:** Setup inicial do projeto, ambiente de desenvolvimento e arquitetura técnica.

| ID | User Story | Sprint | Prioridade |
|----|------------|--------|-------------|
| SETUP-01 | Setup do ambiente de desenvolvimento (monorepo, stack) | 1 | Must |
| SETUP-02 | Definição e documentação da arquitetura do sistema | 1 | Must |

**Entrega:** Sprint 1

---

## Priorização Consolidada

| Sprint | Items | Focus |
|--------|-------|-------|
| **Sprint 1** | AUTH-01, AUTH-02, AUTH-03, REQ-01, REQ-02, REQ-03, ATT-01, SETUP-01, SETUP-02 | Foundation + Core flow |
| **Sprint 2** | (continuação Sprint 1) | MVP entregável |
| **Sprint 3** | AVAIL-01, AVAIL-02, DASH-01, DASH-02, A11Y-01 | Dashboard + Availability |
| **Sprint 4** | REQ-04, ATT-02, DASH-03, A11Y-02 | Polish + Nice-to-have |

---

## Marcos (Milestones)

| Marco | Data | Descrição |
|-------|------|-----------|
| **M1 — Foundation** | Fim Sprint 1 | Autenticação + fluxo básico de solicitação funcionando |
| **M2 — MVP** | Fim Sprint 2 | App utilizável com fluxo completo (solicitar → atender → registrar) |
| **M3 — Dashboard** | Fim Sprint 3 | Dashboard web operacional + gestão de disponibilidade |
| **M4 — Entrega Final** | Julho 2026 | Sistema completo com reports e polish |

---

## Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| App React Native não ficar pronto | Alto | Focar primeiro no web app (Next.js) + backend; mobile pode ser protótipo |
| Atraso na integração WebSocket | Médio | Implementar polling como fallback temporário |
| Falta de testes de acessibilidade | Alto | Envolver usuários PcD cedo; escalar testes com comunidade |
| Dados de teste não refletem realidade | Baixo | Validar com NAC e bolsistas reais |