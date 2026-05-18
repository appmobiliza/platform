# PROJECT.md — Projeto Mobiliza

## Identificação

| Campo | Valor |
|-------|-------|
| Nome | Mobiliza |
| Disciplina | Projeto e Desenvolvimento de Sistemas |
| Instituição | Universidade Federal de Alagoas (UFAL) — Campus A.C. Simões |
| Equipe | Antonio Rodrigo Lima de Andrade Tenório, Eduardo Maciel Alexandre Felipe da Silva Araújo, Josenilton Ferreira da Silva Junior, Matheus Giordani da Silva Oliveira |
| Cliente | Núcleo de Acessibilidade (NAC), Proest/UFAL — Coordenadora: Adriana Guimarães Duarte |
| Período | 2026.1 |
| Entrega | Julho de 2026 |

---

## 1. Visão Geral

O **Mobiliza** é um sistema digital de mobilidade assistida voltado ao atendimento de estudantes com deficiência (PcD) no ambiente universitário da UFAL. O projeto substitui o fluxo manual atual (grupos de WhatsApp + planilhas) por uma solução tecnológica integrada composta por aplicação mobile, dashboard administrativa e backend centralizado.

**Objetivo central:** tornar o serviço MobiUFAL mais ágil, rastreável, organizado e digno para todos os envolvidos — estudantes PcD, bolsistas e coordenação do NAC.

---

## 2. Problema Abordado

O atual processo opera inteiramente via WhatsApp e planilhas preenchidas retroativamente. Isso gera:

- **Ausência de privacidade:** solicitação exposta publicamente no grupo, inibindo uso por alguns estudantes
- **Rastreabilidade comprometida:** registros dependem de memória e preenchimento manual nos finais de semana
- **Falta de dados estruturados:** impossível gerar métricas, identificar horários de pico ou planejar capacidade
- **Escalabilidade limitada:** 9 alunos ativos para 7 bolsistas — modelo manual não escala com demanda crescente

---

## 3. Objetivos do Sistema

| Stakeholder | Objetivo |
|-------------|----------|
| **Estudantes PcD** | Canal privado, acessível, com retorno previsível e suporte a áudio |
| **Bolsistas NAC** | Eliminar sobrecarga de registro manual; ferramenta de trabalho adequada |
| **Coordenação NAC** | Dados estruturados + visibilidade em tempo real; gestão baseada em evidências |

---

## 4. Escopo Funcional (3 Módulos)

### 4.1 Aplicação Mobile (App)

**Perfil Estudante PcD:**
- Autenticação via e-mail institucional @laccan.ufal.br / @ic.ufal.br
- Solicitação privada de deslocamento (origem → destino por pontos fixos do campus)
- Acompanhamento em tempo real (aguardando → aceito → em andamento → concluído)
- Notificações push sobre andamento do serviço
- Interface compatível com TalkBack/VoiceOver + resposta por áudio (TTS)
- Rotas frequentes salvas

**Perfil Bolsista:**
- Toggle de disponibilidade por turno (matutino/vespertino/noturno)
- Receber e aceitar solicitações com visualization das informações do aluno
- Concluir atendimentos com registro automático (elimina planilha manual)
- Visualizar histórico de atendimentos

### 4.2 Dashboard Web (Gestão NAC)

- Visão geral em tempo real (atendimentos ativos, bolsistas disponíveis, pendências)
- Histórico completo de atendimentos com filtros (bolsista, aluno, período)
- Gestão de cadastros (aprovar/desativar bolsistas, gerenciar alunos)
- Métricas operacionais (volume, tempo médio de espera, horários de pico, rotas mais solicitadas)
- Exportação de relatórios em CSV e PDF (compatível com formato atual do NAC)

### 4.3 Backend Centralizado

- Autenticação via e-mail institucional (sem integração com sistemas UFAL)
- Processamento e roteamento de solicitações por turno
- Registro automático de atendimentos
- Comunicação em tempo real via WebSockets
- Armazenamento PostgreSQL com Drizzle ORM

---

## 5. Stack Tecnológica

| Camada | Tecnologia | Status |
|--------|------------|--------|
| **Frontend Web (Dashboard)** | Next.js 16 + React 19 | ✅ Setup inicial |
| **Aplicação Mobile** | React Native | 🔲 Planejado |
| **Backend** | Node.js + tRPC v11 | ✅ Setup inicial |
| **Banco de Dados** | PostgreSQL + Drizzle ORM | ✅ Setup inicial |
| **Comunicação em Tempo Real** | WebSockets | 🔲 Planejado |
| **Infraestrutura** | Vercel (web) + Render (API) | 🔲 Planejado |
| **Monorepo** | Turborepo 2.9 + pnpm 9.0 | ✅ Configurado |
| **Validação de Contratos** | Zod 3.25 | ✅ Configurado |
| **Linguagem** | TypeScript 5.9 (strict) | ✅ Configurado |
| **Estilização** | TailwindCSS v4 | ✅ Configurado |

---

## 6. Arquitetura do Sistema

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   App Mobile    │     │   Dashboard Web  │     │   Backend       │
│  (React Native) │     │    (Next.js)     │     │   (tRPC + WS)   │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    PostgreSQL / Neon     │
                    │      (Drizzle ORM)       │
                    └─────────────────────────┘
```

**Fluxo de dados:**
1. Estudante faz solicitação via App → Backend接收
2. Backend roteia para bolsistas disponíveis no turno
3. Bolsista aceita → Estudante notificado em tempo real
4. Atendimento concluído → Registro automático no banco
5. Dashboard web reflete estado em tempo real (via WebSockets)

---

## 7. Estrutura do Monorepo

```
platform/                    # Turborepo monorepo
├── apps/
│   ├── api/                 # tRPC server (Node.js)
│   └── web/                 # Next.js 16 dashboard (React 19)
├── packages/
│   ├── contracts/           # Zod schemas (contratos compartilhados)
│   ├── db/                  # Drizzle ORM + repositórios
│   ├── domain/              # Regras de negócio puras
│   ├── realtime/           # WebSocket infrastructure (stub)
│   └── ui/                  # Componentes React compartilhados
├── config/
│   ├── eslint-config/
│   └── typescript-config/
├── docs/
└── .specs/                  # Documentação estratégica
```

---

## 8. Stakeholders e Papéis

| Stakeholder | Papel no Sistema |
|-------------|-----------------|
| **Estudantes PcD** | Usuários finais do serviço de mobilidade |
| **Bolsistas NAC** | Executores dos atendimentos; usuários do app |
| **Adriana (NAC)** | Gestora do serviço; usuária principal da dashboard |
| **Proest/UFAL** | Órgão gestor; responsável pelo MobiUFAL |
| **Equipe do Projeto** | Desenvolvimento e manutenção acadêmica |

---

## 9. Entregáveis

1. ✅ Aplicativo mobile funcional (estudantes e bolsistas)
2. ✅ Dashboard web administrativa funcional
3. ✅ Backend completo com API e regras de negócio
4. ✅ Código-fonte versionado em monorepo
5. ✅ Documentação técnica e de arquitetura
6. ✅ Protótipo navegável (Figma)
7. ✅ Vídeo demonstrativo

---

## 10. Limitações e Escopo Negativo

- ❌ Sem integração com SIGAA ou sistemas institucionais UFAL
- ❌ Dados fictícios/anonimizados (LGPD — Lei nº 13.709/2018)
- ❌ Protótipo funcional em ambiente de desenvolvimento (sem produção)
- ❌ Sem suporte técnico contínuo após entrega acadêmica
- ❌ Um único campus (A.C. Simões)
- ❌ Pontos fixos do campus (sem GPS)