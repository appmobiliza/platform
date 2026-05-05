### Reformulação do problema central

O problema anterior estava correto, mas genérico. Com os novos dados, ele pode ser enunciado com muito mais precisão:

**Problema reformulado:**O MobiUFAL opera inteiramente de forma manual via WhatsApp, sem nenhuma camada tecnológica dedicada, o que gera ineficiências no fluxo de solicitação e atendimento, dificulta o registro confiável dos atendimentos e limita a capacidade do NAC de escalar o serviço e tomar decisões baseadas em dados — comprometendo tanto a experiência dos estudantes com deficiência quanto a gestão do programa.

A mudança aqui é sutil mas importante: o problema não é apenas o "alto tempo de espera", mas sim a**ausência de infraestrutura tecnológica**que sustente um serviço que já tem demanda crescente, bolsistas treinados, gestão ativa e potencial de escala — mas que opera com ferramentas improvisadas.

### Ishikawa revisado e consolidado

**Problema como pergunta:**Por que o MobiUFAL não consegue operar com eficiência, rastreabilidade e escalabilidade adequadas?

**CAUSA 1 — Fluxo de solicitação e atendimento totalmente manual e não estruturado**

*Por que isso acontece?*C1.1: Todo o processo — solicitação, confirmação de disponibilidade, execução e registro de conclusão — ocorre por mensagens de texto e áudio em um grupo de WhatsApp, sem nenhum fluxo padronizado ou automatizado.

*Por que isso acontece?*Não existe uma interface dedicada que separe os papéis de solicitante (aluno PcD) e atendente (bolsista), nem que orquestre as etapas do atendimento de forma estruturada.

*Por que isso acontece?*O projeto nasceu como uma iniciativa solidária e cresceu sem suporte tecnológico próprio, dependendo de ferramentas de comunicação genéricas que não foram projetadas para esse fluxo.

**CAUSA 2 — Registro de atendimentos sujeito a falhas e atrasos**

*Por que isso acontece?*C2.1: Os bolsistas preenchem a planilha de registros retroativamente, geralmente nos finais de semana, revisando o histórico do grupo para reconstruir os atendimentos realizados.

*Por que isso acontece?*Não há captura automática de dados durante o atendimento — o registro depende inteiramente da memória e disciplina do bolsista após o fato.

*Por que isso acontece?*A Adriana precisa verificar manualmente a consistência dos registros, o que gera retrabalho, consumo de tempo e risco de inconsistências nos relatórios oficiais do NAC.

*Por que isso acontece?*Nunca foi implementado um sistema que registre automaticamente o atendimento no momento em que ele ocorre, tornando os dados uma consequência do processo e não parte dele.

**CAUSA 3 — Falta de visibilidade em tempo real sobre disponibilidade dos bolsistas**

*Por que isso acontece?*C3.1: Não há mecanismo que indique, a cada momento, quais bolsistas estão disponíveis dentro do turno alocado — a disponibilidade é declarada reativamente, após a solicitação chegar ao grupo.

*Por que isso acontece?*Com apenas 7 bolsistas para 9 alunos ativos e demanda crescente, qualquer gargalo de comunicação impacta diretamente o tempo de espera.

*Por que isso acontece?*O modelo atual não distingue "bolsista no turno" de "bolsista disponível agora" — uma distinção crítica para um serviço que precisa responder em tempo real.

**CAUSA 4 — Canal de solicitação público que inibe o uso por parte dos alunos**

*Por que isso acontece?*C4.1: A solicitação de deslocamento é feita em um grupo coletivo, expondo publicamente a necessidade de ajuda do estudante.

*Por que isso acontece?*Conforme confirmado em entrevista com um aluno do IC, essa exposição gera constrangimento e inibe o uso do serviço por quem valoriza autonomia — mesmo entre quem já conhece e aprecia o MobiUFAL.

*Por que isso acontece?*Não existe canal privado e discreto entre o aluno solicitante e o bolsista disponível.

**CAUSA 5 — Ausência de dados estruturados para gestão e tomada de decisão**

*Por que isso acontece?*C5.1: Os relatórios produzidos pela Adriana dependem de dados inseridos manualmente em planilha, com atrasos e inconsistências — o que compromete a qualidade das informações disponíveis para gestão.

*Por que isso acontece?*Não há visibilidade sobre padrões de demanda: horários de pico, rotas mais solicitadas, frequência por aluno, tempo médio de atendimento ou taxa de atendimentos não realizados.

*Por que isso acontece?*Sem esses dados, o NAC toma decisões sobre alocação de bolsistas, abertura de editais e planejamento operacional com base em percepção — não em evidências.

**CAUSA 6 — Desequilíbrio crescente entre demanda e capacidade de atendimento**

*Por que isso acontece?*C6.1: A demanda vem crescendo nos últimos meses (atualmente 9 alunos ativos para 7 bolsistas), mas o modelo operacional não escala proporcionalmente — o que motivou a abertura de novo edital.

*Por que isso acontece?*Sem dados históricos confiáveis, é difícil dimensionar corretamente quantos bolsistas são necessários por turno e por campus.

*Por que isso acontece?*O crescimento do número de PcD na UFAL é uma tendência que o sistema manual não consegue acompanhar sem um suporte tecnológico que otimize o uso dos recursos existentes.

**CAUSA 7 — Infraestrutura física inacessível amplia artificialmente a dependência do serviço**

*Por que isso acontece?*C7.1: Calçadas irregulares, rampas com desnível e blocos sem acessibilidade (como o IM Velho) tornam certos percursos impossíveis de forma independente, mesmo para alunos que, em condições adequadas, não precisariam de apoio.

*Por que isso acontece?*A infraestrutura física não acompanhou o crescimento do número de PcD no campus.

**Nota:**Esta causa está fora do escopo da solução tecnológica direta, mas pode ser parcialmente endereçada com um sistema de mapeamento de rotas acessíveis dentro do app.

### O que muda na visão da solução

Com esse diagnóstico mais preciso, a solução deixa de ser apenas um "Uber para deficientes" e passa a ter três frentes igualmente importantes:

**Frente 1 — App para alunos e bolsistas:**solicitação privada, matching por disponibilidade e turno, acompanhamento do atendimento em tempo real e suporte a áudio (essencial para alunos com deficiência visual).

**Frente 2 — Registro automático:**cada atendimento iniciado e concluído no app gera um registro automático, eliminando o preenchimento manual retroativo da planilha e o retrabalho da Adriana.

**Frente 3 — Dashboard web para gestão:**voltada para a Adriana e para os bolsistas na salinha da reitoria, exibindo atendimentos em tempo real, histórico, padrões de demanda e insumos prontos para os relatórios do NAC — substituindo o processo atual de planilha manual.

Esse conjunto endereça diretamente C1, C2, C3, C4 e C5, e indiretamente C6. A empolgação do diretor e da Adriana faz sentido: vocês estão propondo resolver dores reais que eles vivem todo dia.

### User

Com base na estrutura do projeto, me ajude a criar user stories, tasks, e etc. para que eu possa organizar o Jira que minha equipe ira usar para gerir o projeto

### Assistant

Com base em tudo que levantamos, aqui está uma estrutura completa para o Jira:

### Estrutura sugerida para o Jira

Antes das histórias, vale definir como organizar o projeto:

**Epics (grandes blocos funcionais)**

- 🟣 EP-01 · Autenticação e Perfis
- 🔵 EP-02 · Solicitação de Atendimento
- 🟢 EP-03 · Gestão de Disponibilidade dos Bolsistas
- 🟡 EP-04 · Registro Automático de Atendimentos
- 🔴 EP-05 · Dashboard de Gestão (Web)
- ⚫ EP-06 · Acessibilidade e Experiência do Usuário
- 🟤 EP-07 · Infraestrutura e Setup do Projeto

### EP-01 · Autenticação e Perfis

**US-01 · Login institucional**

Como aluno ou bolsista, quero me autenticar com meu e-mail institucional da UFAL para que meu perfil seja reconhecido automaticamente pelo sistema.

Tasks:

- Configurar autenticação via e-mail @laccan.ufal.br / @ic.ufal.br
- Definir e implementar os papéis do sistema (aluno PcD, bolsista, gestor NAC)
- Criar fluxo de primeiro acesso e cadastro de perfil

Critérios de aceitação:

- Usuário consegue logar com e-mail institucional
- Sistema identifica automaticamente o papel do usuário
- Usuário sem cadastro é redirecionado para completar perfil

**US-02 · Perfil do aluno com deficiência**

Como aluno com deficiência, quero cadastrar informações sobre minha deficiência e preferências de deslocamento para que os bolsistas possam me atender adequadamente.

Tasks:

- Criar formulário de perfil com tipo de deficiência
- Campo para rotas frequentes e preferências
- Campo para observações importantes ao bolsista (ex.: "prefiro áudio descrição contínua")

Critérios de aceitação:

- Aluno consegue registrar tipo de deficiência
- Informações do perfil são visíveis ao bolsista durante o atendimento
- Perfil pode ser editado a qualquer momento

**US-03 · Perfil do bolsista**

Como bolsista, quero cadastrar meu turno de atuação e informações de contato para que o sistema saiba quando estou disponível para atendimentos.

Tasks:

- Criar formulário de perfil do bolsista
- Associar bolsista ao turno (matutino, vespertino, noturno)
- Validar vínculo com o NAC (aprovação pelo gestor)

Critérios de aceitação:

- Bolsista consegue registrar seu turno
- Gestor consegue aprovar ou remover bolsistas do sistema
- Turno do bolsista é respeitado nas solicitações

### EP-02 · Solicitação de Atendimento

**US-04 · Solicitar deslocamento**

Como aluno com deficiência, quero solicitar um atendimento de forma privada informando minha localização atual e meu destino para que um bolsista disponível possa me atender sem que eu precise expor minha necessidade publicamente.

Tasks:

- Criar tela de nova solicitação
- Campos: ponto de origem, ponto de destino, observações opcionais
- Enviar notificação push para bolsistas disponíveis no turno
- Exibir status da solicitação em tempo real para o aluno

Critérios de aceitação:

- Solicitação é visível apenas para bolsistas do turno, não para outros alunos
- Aluno recebe confirmação assim que um bolsista aceitar
- Aluno pode cancelar a solicitação antes do início do atendimento

**US-05 · Aceitar solicitação de atendimento**

Como bolsista, quero receber notificações de novas solicitações e poder aceitá-las com um toque para que o aluno saiba rapidamente que será atendido.

Tasks:

- Criar tela de solicitações pendentes para o bolsista
- Botão de aceitar atendimento
- Notificar o aluno quando o bolsista aceitar
- Bloquear outras solicitações para o mesmo bolsista enquanto ele estiver em atendimento

Critérios de aceitação:

- Bolsista recebe notificação de nova solicitação
- Apenas um bolsista pode aceitar cada solicitação
- Após aceite, aluno e bolsista veem informações um do outro

**US-06 · Acompanhar status do atendimento**

Como aluno com deficiência, quero acompanhar em tempo real o status do meu atendimento para saber se minha solicitação foi aceita e quando o bolsista está a caminho.

Tasks:

- Criar tela de acompanhamento de atendimento ativo
- Estados do atendimento: aguardando, aceito, em andamento, concluído
- Notificações para cada mudança de estado

Critérios de aceitação:

- Aluno é notificado em cada mudança de estado
- Tela é compatível com leitores de tela (TalkBack / VoiceOver)
- Estados são comunicados também por áudio para alunos com deficiência visual

**US-07 · Rotas frequentes**

Como aluno com deficiência, quero salvar rotas que uso com frequência para agilizar futuras solicitações sem precisar digitar origem e destino novamente.

Tasks:

- Criar funcionalidade de favoritar rotas
- Exibir rotas salvas na tela de nova solicitação
- Permitir renomear e excluir rotas salvas

Critérios de aceitação:

- Aluno consegue salvar uma rota com um nome personalizado
- Rota salva preenche automaticamente os campos de origem e destino
- Funcionalidade acessível via leitor de tela

### EP-03 · Gestão de Disponibilidade dos Bolsistas

**US-08 · Marcar disponibilidade**

Como bolsista, quero indicar quando estou disponível para atendimentos dentro do meu turno para que o sistema direcione solicitações apenas para quem pode atender naquele momento.

Tasks:

- Criar toggle de disponibilidade (disponível / indisponível)
- Atualizar status em tempo real para o sistema
- Exibir status dos bolsistas na dashboard do gestor

Critérios de aceitação:

- Bolsista consegue alternar disponibilidade com um toque
- Solicitações não são direcionadas para bolsistas indisponíveis
- Gestor consegue ver quem está disponível em tempo real

**US-09 · Notificação de solicitação sem bolsista disponível**

Como gestor do NAC, quero ser notificado quando uma solicitação for feita mas não houver bolsista disponível para atendê-la para que eu possa agir rapidamente.

Tasks:

- Definir tempo limite sem aceite para acionar alerta
- Criar notificação para o gestor em caso de solicitação sem atendimento
- Registrar ocorrências de solicitações não atendidas

Critérios de aceitação:

- Gestor é notificado após X minutos sem aceite
- Ocorrência é registrada para análise posterior
- Aluno recebe mensagem informando sobre a indisponibilidade

### EP-04 · Registro Automático de Atendimentos

**US-10 · Registro automático ao concluir atendimento**

Como bolsista, quero que o atendimento seja registrado automaticamente ao marcá-lo como concluído para não precisar preencher a planilha manualmente depois.

Tasks:

- Criar botão de "concluir atendimento" no app
- Capturar automaticamente: bolsista, aluno, origem, destino, horário de início e fim
- Armazenar registro no banco de dados
- Exportar dados no formato compatível com a planilha atual do NAC

Critérios de aceitação:

- Registro é criado automaticamente sem ação adicional do bolsista
- Dados capturados são equivalentes aos da planilha atual
- Gestor consegue visualizar e exportar os registros

**US-11 · Histórico de atendimentos do bolsista**

Como bolsista, quero visualizar meu histórico de atendimentos para acompanhar minha carga horária e ter referência dos serviços prestados.

Tasks:

- Criar tela de histórico no app do bolsista
- Filtros por data e status
- Exibir total de atendimentos e horas estimadas no período

Critérios de aceitação:

- Bolsista consegue ver todos os seus atendimentos anteriores
- Histórico exibe data, hora, aluno atendido, rota e duração
- Dados batem com os registros do sistema

### EP-05 · Dashboard de Gestão (Web)

**US-12 · Visão geral em tempo real**

Como gestora do NAC, quero ver em tempo real os atendimentos em andamento, bolsistas disponíveis e solicitações pendentes para ter controle operacional do serviço.

Tasks:

- Criar dashboard web responsiva
- Painel de atendimentos ativos
- Painel de bolsistas por status (disponível, em atendimento, offline)
- Painel de solicitações pendentes sem aceite

Critérios de aceitação:

- Dashboard atualiza em tempo real sem necessidade de recarregar a página
- Funciona no computador da salinha da reitoria
- Informações são claras e escaneáveis rapidamente

**US-13 · Relatórios de atendimento**

Como gestora do NAC, quero gerar relatórios de atendimentos por período para substituir o processo manual de planilha e embasar os relatórios institucionais com dados confiáveis.

Tasks:

- Criar filtros por período, bolsista, aluno e tipo de atendimento
- Gerar relatório exportável em CSV ou Excel
- Exibir métricas: total de atendimentos, tempo médio, alunos atendidos, bolsistas mais ativos

Critérios de aceitação:

- Gestora consegue gerar relatório com um clique
- Dados exportados são compatíveis com o formato atual da planilha
- Relatório pode ser filtrado por qualquer combinação de parâmetros

**US-14 · Gestão de bolsistas**

Como gestora do NAC, quero cadastrar, ativar e desativar bolsistas no sistema para manter o quadro atualizado conforme os editais e desligamentos.

Tasks:

- Criar tela de gestão de bolsistas
- Ações: adicionar, editar turno, desativar
- Histórico de bolsistas ativos por período

Critérios de aceitação:

- Gestora consegue adicionar novo bolsista sem depender de suporte técnico
- Bolsista desativado perde acesso ao app imediatamente
- Histórico preserva registros de bolsistas desligados

### EP-06 · Acessibilidade e Experiência do Usuário

**US-15 · Interface compatível com leitores de tela**

Como aluno com deficiência visual, quero que todas as funcionalidades do app sejam acessíveis via leitor de tela para que eu possa usá-lo de forma completamente independente.

Tasks:

- Auditar todas as telas com TalkBack (Android) e VoiceOver (iOS)
- Garantir labels acessíveis em todos os elementos interativos
- Testar fluxo completo de solicitação sem uso da visão

Critérios de aceitação:

- Fluxo completo de solicitação realizável apenas com leitor de tela
- Nenhum elemento interativo sem label acessível
- Testado com ao menos um usuário real com deficiência visual

**US-16 · Comunicação por áudio no atendimento**

Como aluno com deficiência visual, quero receber confirmações e atualizações de status por áudio para não depender de leitura de tela durante o deslocamento.

Tasks:

- Implementar Text-to-Speech nas notificações de status
- Opção de ativar/desativar áudio automático no perfil
- Garantir compatibilidade com fone de ouvido

Critérios de aceitação:

- Mudanças de status são lidas automaticamente em voz alta quando opção ativada
- Volume e velocidade ajustáveis
- Funciona com tela bloqueada

### EP-07 · Infraestrutura e Setup do Projeto

**US-17 · Setup do ambiente de desenvolvimento**

Como equipe, queremos ter o ambiente de desenvolvimento configurado e padronizado para que todos possam contribuir sem problemas de compatibilidade.

Tasks:

- Definir stack tecnológica (linguagem, framework, banco de dados)
- Configurar repositório no GitHub com branches e política de PRs
- Configurar ambiente local (docker ou equivalente)
- Criar README com instruções de setup

**US-18 · Definição da arquitetura do sistema**

Como equipe, queremos documentar a arquitetura da solução antes de iniciar o desenvolvimento para garantir que as decisões técnicas sejam consistentes.

Tasks:

- Definir separação entre app mobile e dashboard web
- Escolher solução de backend e banco de dados
- Documentar modelo de dados inicial (atendimento, usuário, solicitação, registro)
- Validar arquitetura com o professor

### Sugestão de priorização para a Sprint 1

Dado o prazo acadêmico, a sugestão é atacar primeiro o que prova o valor central da solução:

**Must have (Sprint 1 e 2)**US-01, US-02, US-03, US-04, US-05, US-06, US-10, US-17, US-18

**Should have (Sprint 3)**US-08, US-09, US-12, US-13, US-15

**Nice to have (Sprint 4 em diante)**US-07, US-11, US-14, US-16

Se quiser, posso detalhar os critérios de aceitação de alguma história específica, montar o modelo de dados inicial ou sugerir a stack tecnológica com base no perfil da equipe.

### User

Eu preciso entregar o protótipo de alta fidelidade da aplicação no Figma o quanto antes.
Por favor, me descreva quais serão as telas (tanto do app mobile, quanto da dashboard), os diferentes fluxos de usuários, o que deve conter em cada tela, etc.

### Assistant

Com base em tudo que levantamos, aqui está a especificação completa para guiar o protótipo no Figma:

### Considerações antes de começar

**Paleta sugerida**Dado que o projeto está ligado à UFAL, vale usar como referência as cores institucionais como ponto de partida — azul escuro e dourado — mas adaptando para uma identidade mais moderna e acessível. O contraste entre elementos é crítico dado o público com deficiência visual.

**Tipografia**Priorize fontes com alta legibilidade em tamanhos maiores. Inter ou Nunito são boas escolhas para interfaces acessíveis.

**Componentes prioritários no Figma**Antes de montar as telas, crie os componentes base: botões primário/secundário, cards de solicitação, badges de status, inputs, e o toggle de disponibilidade. Isso acelera muito a montagem das telas.

### PARTE 1 — APP MOBILE

O app tem três perfis com experiências distintas:**Aluno PcD**,**Bolsista**e uma área compartilhada de autenticação.
FLUXO 0 — Autenticação (compartilhado)
**Tela 0.1 · Splash Screen**

- Logo do projeto centralizado
- Fundo na cor primária
- Duração curta, transição suave para o login

**Tela 0.2 · Login**

- Logo do projeto no topo
- Campo de e-mail institucional
- Campo de senha
- Botão "Entrar"
- Link "Primeiro acesso? Cadastre-se"
- Texto pequeno: "Use seu e-mail institucional da UFAL"

**Tela 0.3 · Primeiro acesso — seleção de perfil**

- Título: "Como você vai usar o app?"
- Dois cards grandes e bem espaçados:

  - 🎓 Sou estudante com deficiência
  - 🤝 Sou bolsista do NAC
- Botão "Continuar" habilitado após seleção

**Tela 0.4a · Cadastro — Aluno PcD**

- Nome completo (preenchido automaticamente via e-mail institucional se possível)
- Matrícula
- Curso e período
- Tipo de deficiência (seleção múltipla): física/motora, visual, auditiva, TEA, múltipla, outra
- Campo: "Observações para o bolsista" (ex.: prefiro áudio descrição contínua, uso cadeira de rodas elétrica)
- Toggle: "Ativar respostas por áudio automaticamente"
- Botão "Finalizar cadastro"

**Tela 0.4b · Cadastro — Bolsista**

- Nome completo
- Matrícula
- Turno de atuação (matutino / vespertino / noturno) — seleção única
- Mensagem: "Seu cadastro será validado pelo NAC antes da ativação"
- Botão "Enviar para aprovação"

**Tela 0.5 · Aguardando aprovação (Bolsista)**

- Ícone de relógio ou pendente
- Texto: "Seu cadastro foi enviado para o NAC. Você receberá uma notificação assim que for aprovado."
- Botão "Sair"
FLUXO 1 — Experiência do Aluno PcD
**Tela 1.1 · Home do Aluno**Essa é a tela principal e deve ser extremamente simples e direta.

- Saudação no topo: "Olá, [Nome] 👋"
- Badge de status do serviço: "Serviço disponível agora" (verde) ou "Nenhum bolsista disponível no momento" (amarelo)
- Botão principal grande e centralizado:**"Solicitar deslocamento"**
- Seção "Rotas frequentes" (se houver rotas salvas):

  - Cards horizontais com nome da rota salva
  - Toque no card inicia solicitação com campos pré-preenchidos
- Seção "Último atendimento":

  - Card com data, bolsista e rota do último atendimento
- Barra de navegação inferior: Home · Histórico · Perfil

**Tela 1.2 · Nova solicitação**

- Título: "Novo deslocamento"
- Campo "Onde você está agora?" com lista de pontos do campus (dropdown ou busca): IC, RU, Biblioteca, CCEN, Reitoria, FAED, FAMED, CECA etc.
- Campo "Para onde você quer ir?" — mesma lista
- Campo de texto opcional: "Alguma observação para o bolsista?"
- Toggle: "Salvar como rota frequente" → se ativado, campo para nomear a rota
- Resumo da solicitação antes de confirmar:

  - Origem → Destino
  - Bolsistas disponíveis no turno: X
- Botão grande: "Confirmar solicitação"

**Tela 1.3 · Aguardando aceite**

- Ícone animado de busca/espera
- Texto: "Procurando bolsista disponível..."
- Informações da solicitação: origem → destino
- Tempo decorrido desde a solicitação
- Botão secundário: "Cancelar solicitação"
- A tela atualiza automaticamente quando um bolsista aceitar

**Tela 1.4 · Atendimento aceito**

- Banner de confirmação: "Bolsista a caminho! ✓"
- Card do bolsista:

  - Nome
  - Foto (se cadastrada)
  - Badge de turno
  - Observação se relevante
- Rota confirmada: Origem → Destino
- Status atual: "A caminho" / "Em andamento"
- Botão: "Concluído" (ativado apenas quando o bolsista marcar como concluído)
- Espaço para avaliação rápida após conclusão (estrelas + campo opcional de comentário)

**Tela 1.5 · Histórico de atendimentos**

- Lista de atendimentos anteriores em ordem cronológica
- Cada item: data, bolsista, rota, status (concluído / cancelado)
- Toque em um item abre o detalhe do atendimento
- Filtro por período no topo

**Tela 1.6 · Detalhe do atendimento**

- Data e hora de início e fim
- Bolsista responsável
- Rota: origem → destino
- Duração
- Observações registradas
- Avaliação dada (se houver)

**Tela 1.7 · Perfil do Aluno**

- Foto e nome
- Tipo de deficiência cadastrada
- Preferências de atendimento
- Rotas favoritas salvas (com opção de editar e excluir)
- Toggle de áudio automático
- Botão "Editar perfil"
- Botão "Sair"
FLUXO 2 — Experiência do Bolsista
**Tela 2.1 · Home do Bolsista**

- Saudação: "Olá, [Nome]"
- Toggle grande e destacado no topo:**"Estou disponível"**(verde) /**"Indisponível"**(cinza)

  - Quando ativado: "Você está recebendo solicitações"
  - Quando desativado: "Você não está recebendo solicitações"
- Turno atual: "Você está no turno Matutino"
- Card de solicitação pendente (se houver):

  - Origem → Destino
  - Nome do aluno
  - Observações do perfil do aluno (tipo de deficiência, preferências)
  - Tempo desde a solicitação
  - Botões: "Recusar" (secundário) e "Aceitar atendimento" (primário, grande)
- Se não houver solicitação: ilustração/mensagem "Nenhuma solicitação no momento"
- Barra de navegação: Home · Atendimentos · Histórico · Perfil

**Tela 2.2 · Atendimento em andamento**

- Banner: "Atendimento em andamento"
- Card do aluno:

  - Nome
  - Tipo de deficiência
  - Observações importantes em destaque
- Rota: Origem → Destino
- Cronômetro de duração do atendimento
- Lembrete de áudio descrição (se o aluno tiver deficiência visual): "Lembre-se de fazer a áudio descrição do ambiente"
- Botão grande: "Concluir atendimento"
- Botão secundário: "Reportar problema"

**Tela 2.3 · Atendimento concluído**

- Ícone de confirmação
- Resumo do atendimento: aluno, rota, duração
- Mensagem: "Atendimento registrado automaticamente ✓"
- Botão: "Voltar para o início"

**Tela 2.4 · Histórico do Bolsista**

- Lista de atendimentos realizados
- Cada item: data, aluno, rota, duração
- Totalizador no topo: "X atendimentos este mês · Y horas estimadas"
- Filtro por período

**Tela 2.5 · Perfil do Bolsista**

- Foto e nome
- Turno de atuação
- Status de aprovação pelo NAC
- Estatísticas: total de atendimentos, horas no mês
- Botão "Editar perfil"
- Botão "Sair"
Estados e feedbacks visuais importantes no app
Esses não são telas completas, mas estados que precisam ser prototipados:

- **Toast de confirmação**ao aceitar ou concluir atendimento
- **Tela de erro**quando não há conexão
- **Modal de cancelamento**com confirmação antes de cancelar solicitação
- **Notificação push**(mostrar o layout do banner de notificação)
- **Empty state**para histórico vazio e rotas favoritas vazias

### PARTE 2 — DASHBOARD WEB (Gestão NAC)

A dashboard é voltada para a Adriana e para os bolsistas na salinha da reitoria. Deve funcionar bem em monitor, ser densa em informação mas visualmente organizada.
Layout geral da Dashboard
**Estrutura fixa:**

- Sidebar esquerda com navegação principal
- Header com nome do usuário logado, data/hora e badge de status do sistema
- Área de conteúdo principal à direita

**Itens da sidebar:**

- 📊 Visão Geral
- 📋 Atendimentos
- 👥 Bolsistas
- 🎓 Alunos
- 📁 Relatórios
- ⚙️ Configurações
Tela D.1 · Visão Geral (Home da Dashboard)
Esta é a tela principal — deve dar uma fotografia completa do serviço em tempo real.

**Bloco 1 — KPIs do dia (cards no topo):**

- Atendimentos hoje
- Atendimentos em andamento agora
- Solicitações pendentes (sem bolsista)
- Bolsistas disponíveis agora / total no turno

**Bloco 2 — Mapa de status em tempo real:**

- Lista ou grid de bolsistas no turno atual
- Cada bolsista: nome, foto, status (disponível / em atendimento / offline), turno
- Se em atendimento: rota e aluno sendo atendido

**Bloco 3 — Solicitações pendentes:**

- Tabela com solicitações aguardando aceite
- Colunas: aluno, origem, destino, tempo aguardando, ação (notificar bolsistas)
- Alerta visual se alguma solicitação estiver há muito tempo sem resposta

**Bloco 4 — Feed de atividade recente:**

- Timeline dos últimos atendimentos iniciados e concluídos
- Cada item: horário, bolsista, aluno, rota
Tela D.2 · Atendimentos
**Filtros no topo:**

- Por período (hoje / esta semana / este mês / personalizado)
- Por bolsista
- Por aluno
- Por status (concluído / cancelado / em andamento)

**Tabela principal:**

- Colunas: data/hora, bolsista, aluno, origem, destino, duração, status
- Ordenação por qualquer coluna
- Clique em uma linha abre o detalhe do atendimento

**Painel de detalhe (lateral ou modal):**

- Todos os dados do atendimento
- Observações registradas
- Avaliação do aluno (se houver)
Tela D.3 · Bolsistas
**Lista de bolsistas ativos:**

- Tabela: nome, matrícula, curso, turno, status (ativo / pendente / desativado), total de atendimentos no mês
- Botão "Adicionar bolsista"
- Ações por linha: ver histórico, editar turno, desativar

**Modal de aprovação de novo bolsista:**

- Dados do cadastro enviado pelo app
- Botões: "Aprovar" e "Recusar"

**Tela de detalhe do bolsista:**

- Dados cadastrais
- Histórico de atendimentos com filtros
- Gráfico de atendimentos por semana
- Total de horas estimadas no período
Tela D.4 · Alunos
**Lista de alunos cadastrados:**

- Tabela: nome, matrícula, curso, tipo de deficiência, total de solicitações, último atendimento
- Clique abre detalhe

**Tela de detalhe do aluno:**

- Dados cadastrais e tipo de deficiência
- Observações do perfil
- Histórico de solicitações
- Bolsistas que mais o atenderam
- Rotas mais solicitadas
Tela D.5 · Relatórios
**Filtros:**

- Período (com seletor de datas)
- Bolsista específico ou todos
- Aluno específico ou todos

**Métricas exibidas:**

- Total de atendimentos no período
- Tempo médio de espera (solicitação → aceite)
- Tempo médio de atendimento
- Atendimentos por bolsista (ranking)
- Atendimentos por aluno
- Horários de pico (gráfico de barras por hora do dia)
- Dias da semana com mais solicitações
- Taxa de solicitações não atendidas

**Ações:**

- Botão "Exportar CSV" — gera arquivo compatível com a planilha atual do NAC
- Botão "Exportar PDF" — gera relatório formatado para uso institucional
Tela D.6 · Configurações
- Gerenciar pontos do campus (adicionar, editar, desativar locais)
- Configurar tempo limite para alerta de solicitação sem resposta
- Gerenciar turnos e horários
- Dados do NAC (nome, contato, campus)
- Gerenciar conta do gestor

### Fluxos principais para prototipar no Figma

Esses são os fluxos que precisam estar conectados e clicáveis no protótipo:

**Fluxo A — Aluno solicita atendimento:**0.2 → 1.1 → 1.2 → 1.3 → 1.4 → (conclusão) → avaliação

**Fluxo B — Bolsista aceita e conclui atendimento:**0.2 → 2.1 (toggle ativo) → notificação de solicitação → 2.2 → 2.3

**Fluxo C — Primeiro acesso do aluno:**0.2 → 0.3 → 0.4a → 1.1

**Fluxo D — Primeiro acesso do bolsista:**0.2 → 0.3 → 0.4b → 0.5 → (aprovação) → 2.1

**Fluxo E — Gestora consulta relatório:**D.1 → D.5 → (filtros) → exportar

**Fluxo F — Gestora aprova novo bolsista:**D.3 → modal de aprovação → bolsista ativo

### Ordem sugerida para construção no Figma

- Montar o Design System primeiro: cores, tipografia, espaçamentos, componentes base
- Telas do app: fluxo de autenticação → home do aluno → fluxo de solicitação → fluxo do bolsista
- Conectar os fluxos A e B (são os mais importantes para apresentar)
- Dashboard: Visão Geral → Atendimentos → Relatórios
- Telas secundárias: perfis, histórico, configurações

Se quiser, posso detalhar o Design System, sugerir um layout específico para alguma tela ou descrever os estados de erro e vazios com mais profundidade.

### User

Como seria a Ferramenta 1 com base na nova proposta?

### Assistant

### Ferramenta 1: Estruturando o problema

**1. Qual é o problema?**O MobiUFAL opera inteiramente de forma manual via WhatsApp, sem nenhuma infraestrutura tecnológica dedicada, o que gera ineficiências no fluxo de solicitação e atendimento, dificulta o registro confiável dos dados e cria barreiras sociais que inibem o uso do serviço — comprometendo a experiência dos estudantes com deficiência e a capacidade de gestão do NAC.

**2. Por que isso importa?**Porque estudantes com deficiência dependem diretamente do MobiUFAL para se deslocar pelo campus com segurança e autonomia, e as falhas operacionais do sistema atual — tempo de espera imprevisível, canal público que expõe quem pede ajuda e registros manuais sujeitos a erros — afetam diretamente a qualidade e a confiabilidade do serviço.

*Por que isso importa?*Porque a demanda pelo serviço vem crescendo nos últimos meses e o modelo atual, baseado em mensagens de WhatsApp e planilhas preenchidas retroativamente, não tem capacidade de escalar — o que significa que, sem mudança, o problema tende a se agravar conforme mais estudantes com deficiência ingressam na UFAL.

*Por que isso importa?*Porque a ineficiência operacional e a ausência de dados confiáveis impedem que o NAC tome decisões embasadas sobre alocação de bolsistas, identificação de horários críticos e planejamento do serviço — comprometendo não só o dia a dia dos atendimentos, mas também a capacidade institucional de garantir inclusão de forma sustentável.

**3. Para quem isso importa?**Principalmente para os estudantes com deficiência vinculados ao MobiUFAL, que dependem do serviço para participar plenamente da vida acadêmica. Também importa diretamente para os bolsistas do NAC, que precisam de ferramentas adequadas para exercer bem seu papel, e para a coordenação do NAC — representada pela Adriana —, que hoje gasta tempo considerável verificando e corrigindo registros manualmente.

**4. Quem precisa se preocupar mais?**A coordenação do NAC e a Proest, responsáveis pela gestão e pelo financiamento do MobiUFAL. O diretor da Proest e a Adriana, com quem já estabelecemos contato, demonstraram interesse direto em uma solução e estão dispostos a atuar como clientes do projeto. Também é relevante o envolvimento dos próprios bolsistas, que são os usuários operacionais do sistema, e dos estudantes com deficiência, cujas necessidades devem guiar todas as decisões de design.

**5. Como levamos as pessoas a dar mais atenção ao tema? (Como medimos o problema ou contamos histórias a seu respeito)**Com dados concretos já levantados: 7 bolsistas para 9 alunos ativos, demanda crescente que motivou a abertura de um novo edital, registros preenchidos retroativamente nos finais de semana com base no histórico do grupo e verificação manual pela Adriana para garantir consistência. Somado a isso, o relato direto de um estudante com deficiência do IC que conhece e valoriza o MobiUFAL mas evita usá-lo por constrangimento em pedir ajuda publicamente — o que ilustra como a limitação tecnológica cria barreiras que vão além da operação e afetam a dignidade e a autonomia de quem o serviço foi feito para proteger.

**6. Qual será o resultado quando o problema for resolvido?**Estudantes com deficiência poderão solicitar deslocamentos de forma privada, rápida e acessível — inclusive por áudio — sem depender de um grupo de WhatsApp. Bolsistas receberão solicitações de forma estruturada, com todas as informações necessárias para um atendimento de qualidade, e cada atendimento será registrado automaticamente. A Adriana terá acesso a uma dashboard com dados em tempo real e poderá gerar relatórios institucionais com um clique, sem retrabalho. O NAC, por fim, terá pela primeira vez uma visão clara da operação — horários de pico, rotas mais solicitadas, taxa de atendimento — para planejar o serviço com base em evidências e garantir que ele continue crescendo junto com a demanda.

### User

Alguma forma de nomear melhor o  problema ao final no Ishikawa?

### Assistant

O enunciado atual está tecnicamente correto, mas é longo e pouco visual para um diagrama. A ideia no Ishikawa é que o problema na "cabeça do peixe" seja curto, direto e impactante — uma frase que qualquer pessoa entenda de relance.

Aqui vão algumas opções, do mais formal ao mais direto:

**Opções mais formais**

- "MobiUFAL não consegue operar com eficiência, rastreabilidade e escalabilidade"
- "Gestão e operação do MobiUFAL comprometidas pela ausência de suporte tecnológico"
- "Serviço de mobilidade assistida com baixa confiabilidade operacional e de gestão"

**Opções mais diretas**

- "MobiUFAL opera de forma manual, ineficiente e sem dados confiáveis"
- "Atendimentos do MobiUFAL são lentos, subregistrados e difíceis de gerir"
- "Ausência de tecnologia dedicada compromete o MobiUFAL"

**Opções mais centradas no usuário**

- "Estudantes com deficiência enfrentam barreiras para acessar e confiar no MobiUFAL"
- "MobiUFAL não garante atendimento ágil, privado e rastreável às PcD"

Minha sugestão seria**"MobiUFAL opera de forma manual, ineficiente e sem dados confiáveis"**— é curta o suficiente para caber na cabeça do peixe, cobre os três grandes problemas identificados (operação, experiência e gestão) e é imediatamente compreensível por qualquer pessoa que leia o diagrama, incluindo o diretor da Proest e a Adriana.

### User

Pasted Content #1:

Pasted Content

```
Roteiro: Pitch AB1
Gancho e a Dor: (deve dar 1min isso aqui)
Quando pensamos em vida universitária, pensamos em autonomia. Pensamos na liberdade de ir da biblioteca pro RU, ou do IC pra Reitoria, explorar os blocos e andar pela faculdade. Mas, a realidade de muitos estudantes é completamente outra. Alunos com deficiência (PcD) não têm essa autonomia de forma tão simples.
Hoje, a UFAL possui o projeto MobiUFAL, que fornece bolsistas para auxiliar no deslocamento desses alunos. Convenhamos, é uma iniciativa muito nobre, no entanto a execução parou no tempo.
Sabe como um aluno com deficiência visual ou motora pede ajuda hoje? Em um grupo do Zap. 
(PAUSA DRAMÁTICA)
Durante nossa pesquisa, ouvimos o relato de um aluno que evita usar o serviço por constrangimento. Ter que expor sua vulnerabilidade publicamente em um grupo tira o que o aluno mais busca: a sua dignidade.
Além do impacto social, há o caos operacional. Tudo é totalmente manual. Os bolsistas anotam os atendimentos no fim de semana, de cabeça, em uma planilha. A Adriana, que trabalha no NAC, perde horas checando dados retroativos. E a demanda continua crescendo, hoje são 9 alunos ativos para 7 bolsistas, e esse modelo via WhatsApp simplesmente não escala.
A Solução (O "What" e o "How") (1min e meio aqui)
E pensando em tudo isso, tivemos uma ideia que auxiliaria todos os envolvidos: o Mobiliza. Nós transformamos um "grupo de WhatsApp caótico" em uma plataforma completa, dividida em três frentes:
Para Alunos PcD, Bolsistas e Gestão, vamos destrinchar cada um delas 
(PAUSA DRAMÁTICA)
Para o Aluno PcD: Um aplicativo acessível (totalmente compatível com leitores de tela), onde ele pode solicitar o deslocamento de forma privada, rápida e com rotas salvas. Ele sabe na hora se há alguém disponível e acompanha o bolsista a caminho.
Para o Bolsista: O app vira sua ferramenta de atuação. Ele marca se está "Disponível" naquele turno, recebe a notificação da corrida, aceita com um clique e, o melhor, ao finalizar, o atendimento é registrado automaticamente. Fim do preenchimento de planilhas no fim de semana.
Para a Gestão (NAC): Um Dashboard Web em tempo real. A coordenação abre a tela na reitoria e vê exatamente quem está atendendo quem, gera relatórios em CSV com um clique e toma decisões baseadas em dados reais, não em percepções.
A Estrutura e Viabilidade (2:30 - 4:00)
Para provar que essa ideia se sustenta na prática, nós estruturamos nossa operaçx’ão baseada no modelo 5W2H, um framework de gestão e planejamento.
Na prática, o que estamos entregando é um ecossistema de mobilidade interna via App e Web. E estamos fazendo isso porque a UFAL precisa devolver a dignidade ao aluno PcD, dar eficiência ao bolsista e gerar dados confiáveis para a instituição.
Esse sistema será operado diretamente pelos alunos e bolsistas, sob a gestão atenta do NAC e da Proest. Ele vai funcionar em todo o campus, mapeando os blocos, e o mais importante: em tempo real. A necessidade do aluno e a disponibilidade do bolsista se encontram no exato momento do clique.
E como vamos garantir que isso funcione? Através de tecnologia de ponta, perfis integrados ao e-mail institucional para segurança, e interfaces rigorosamente testadas para acessibilidade.
Por fim, falando de viabilidade, o ganho operacional é imenso. O verdadeiro 'custo' que temos hoje é a ineficiência e a evasão dos alunos que desistem do serviço. O nosso retorno é eliminar horas de trabalho manual da coordenação e entregar um serviço escalável, pronto para abraçar os novos estudantes.
(4:00 - 5:00) O Fechamento e Chamada para Ação
Hoje, o diretor da Proest e a coordenação do NAC já validaram nossa ideia. Eles precisam disso. Nós já mapeamos todas as Histórias de Usuário, desenhamos a arquitetura do banco de dados e temos a interface pronta para ser codificada.
O MobiUFAL nasceu como uma iniciativa solidária, mas para crescer, ele precisa de infraestrutura tecnológica.
O Mobiliza não é apenas um aplicativo de agendamento. É sobre devolver o controle da própria rotina para o aluno com deficiência. É garantir que a UFAL seja, na prática, um espaço onde a inclusão funciona de forma eficiente, invisível e digna.
Muito obrigado!


```

### User

Pasted Content #1:

Pasted Content

```
Roteiro: Pitch AB1
Gancho e a Dor: (deve dar 1min isso aqui)
Quando pensamos em vida universitária, pensamos em autonomia. Pensamos na liberdade de ir da biblioteca pro RU, ou do IC pra Reitoria, explorar os blocos e andar pela faculdade. Mas, a realidade de muitos estudantes é completamente outra. Alunos com deficiência (PcD) não têm essa autonomia de forma tão simples.
Hoje, a UFAL possui o projeto MobiUFAL, que fornece bolsistas para auxiliar no deslocamento desses alunos. Convenhamos, é uma iniciativa muito nobre, no entanto a execução parou no tempo.
Sabe como um aluno com deficiência visual ou motora pede ajuda hoje? Em um grupo do Zap. 
(PAUSA DRAMÁTICA)
Durante nossa pesquisa, ouvimos o relato de um aluno que evita usar o serviço por constrangimento. Ter que expor sua vulnerabilidade publicamente em um grupo tira o que o aluno mais busca: a sua dignidade.
Além do impacto social, há o caos operacional. Tudo é totalmente manual. Os bolsistas anotam os atendimentos no fim de semana, de cabeça, em uma planilha. A Adriana, que trabalha no NAC, perde horas checando dados retroativos. E a demanda continua crescendo, hoje são 9 alunos ativos para 7 bolsistas, e esse modelo via WhatsApp simplesmente não escala.
A Solução (O "What" e o "How") (1min e meio aqui)
E pensando em tudo isso, tivemos uma ideia que auxiliaria todos os envolvidos: o Mobiliza. Nós transformamos um "grupo de WhatsApp caótico" em uma plataforma completa, dividida em três frentes:
Para Alunos PcD, Bolsistas e Gestão, vamos destrinchar cada um delas 
(PAUSA DRAMÁTICA)
Para o Aluno PcD: Um aplicativo acessível (totalmente compatível com leitores de tela), onde ele pode solicitar o deslocamento de forma privada, rápida e com rotas salvas. Ele sabe na hora se há alguém disponível e acompanha o bolsista a caminho.
Para o Bolsista: O app vira sua ferramenta de atuação. Ele marca se está "Disponível" naquele turno, recebe a notificação da corrida, aceita com um clique e, o melhor, ao finalizar, o atendimento é registrado automaticamente. Fim do preenchimento de planilhas no fim de semana.
Para a Gestão (NAC): Um Dashboard Web em tempo real. A coordenação abre a tela na reitoria e vê exatamente quem está atendendo quem, gera relatórios em CSV com um clique e toma decisões baseadas em dados reais, não em percepções.
A Estrutura e Viabilidade (2:30 - 4:00)
Para provar que essa ideia se sustenta na prática, nós estruturamos nossa operaçx’ão baseada no modelo 5W2H, um framework de gestão e planejamento.
Na prática, o que estamos entregando é um ecossistema de mobilidade interna via App e Web. E estamos fazendo isso porque a UFAL precisa devolver a dignidade ao aluno PcD, dar eficiência ao bolsista e gerar dados confiáveis para a instituição.
Esse sistema será operado diretamente pelos alunos e bolsistas, sob a gestão atenta do NAC e da Proest. Ele vai funcionar em todo o campus, mapeando os blocos, e o mais importante: em tempo real. A necessidade do aluno e a disponibilidade do bolsista se encontram no exato momento do clique.
E como vamos garantir que isso funcione? Através de tecnologia de ponta, perfis integrados ao e-mail institucional para segurança, e interfaces rigorosamente testadas para acessibilidade.
Por fim, falando de viabilidade, o ganho operacional é imenso. O verdadeiro 'custo' que temos hoje é a ineficiência e a evasão dos alunos que desistem do serviço. O nosso retorno é eliminar horas de trabalho manual da coordenação e entregar um serviço escalável, pronto para abraçar os novos estudantes.
(4:00 - 5:00) O Fechamento e Chamada para Ação
Hoje, o diretor da Proest e a coordenação do NAC já validaram nossa ideia. Eles precisam disso. Nós já mapeamos todas as Histórias de Usuário, desenhamos a arquitetura do banco de dados e temos a interface pronta para ser codificada.
O MobiUFAL nasceu como uma iniciativa solidária, mas para crescer, ele precisa de infraestrutura tecnológica.
O Mobiliza não é apenas um aplicativo de agendamento. É sobre devolver o controle da própria rotina para o aluno com deficiência. É garantir que a UFAL seja, na prática, um espaço onde a inclusão funciona de forma eficiente, invisível e digna.
Muito obrigado!


```
```
Roteiro: Pitch AB1
Gancho e a Dor: (deve dar 1min isso aqui)
Quando pensamos em vida universitária, pensamos em autonomia. Pensamos na liberdade de ir da biblioteca pro RU, ou do IC pra Reitoria, explorar os blocos e andar pela faculdade. Mas, a realidade de muitos estudantes é completamente outra. Alunos com deficiência (PcD) não têm essa autonomia de forma tão simples.
Hoje, a UFAL possui o projeto MobiUFAL, que fornece bolsistas para auxiliar no deslocamento desses alunos. Convenhamos, é uma iniciativa muito nobre, no entanto a execução parou no tempo.
Sabe como um aluno com deficiência visual ou motora pede ajuda hoje? Em um grupo do Zap. 
(PAUSA DRAMÁTICA)
Durante nossa pesquisa, ouvimos o relato de um aluno que evita usar o serviço por constrangimento. Ter que expor sua vulnerabilidade publicamente em um grupo tira o que o aluno mais busca: a sua dignidade.
Além do impacto social, há o caos operacional. Tudo é totalmente manual. Os bolsistas anotam os atendimentos no fim de semana, de cabeça, em uma planilha. A Adriana, que trabalha no NAC, perde horas checando dados retroativos. E a demanda continua crescendo, hoje são 9 alunos ativos para 7 bolsistas, e esse modelo via WhatsApp simplesmente não escala.
A Solução (O "What" e o "How") (1min e meio aqui)
E pensando em tudo isso, tivemos uma ideia que auxiliaria todos os envolvidos: o Mobiliza. Nós transformamos um "grupo de WhatsApp caótico" em uma plataforma completa, dividida em três frentes:
Para Alunos PcD, Bolsistas e Gestão, vamos destrinchar cada um delas 
(PAUSA DRAMÁTICA)
Para o Aluno PcD: Um aplicativo acessível (totalmente compatível com leitores de tela), onde ele pode solicitar o deslocamento de forma privada, rápida e com rotas salvas. Ele sabe na hora se há alguém disponível e acompanha o bolsista a caminho.
Para o Bolsista: O app vira sua ferramenta de atuação. Ele marca se está "Disponível" naquele turno, recebe a notificação da corrida, aceita com um clique e, o melhor, ao finalizar, o atendimento é registrado automaticamente. Fim do preenchimento de planilhas no fim de semana.
Para a Gestão (NAC): Um Dashboard Web em tempo real. A coordenação abre a tela na reitoria e vê exatamente quem está atendendo quem, gera relatórios em CSV com um clique e toma decisões baseadas em dados reais, não em percepções.
A Estrutura e Viabilidade (2:30 - 4:00)
Para provar que essa ideia se sustenta na prática, nós estruturamos nossa operaçx’ão baseada no modelo 5W2H, um framework de gestão e planejamento.
Na prática, o que estamos entregando é um ecossistema de mobilidade interna via App e Web. E estamos fazendo isso porque a UFAL precisa devolver a dignidade ao aluno PcD, dar eficiência ao bolsista e gerar dados confiáveis para a instituição.
Esse sistema será operado diretamente pelos alunos e bolsistas, sob a gestão atenta do NAC e da Proest. Ele vai funcionar em todo o campus, mapeando os blocos, e o mais importante: em tempo real. A necessidade do aluno e a disponibilidade do bolsista se encontram no exato momento do clique.
E como vamos garantir que isso funcione? Através de tecnologia de ponta, perfis integrados ao e-mail institucional para segurança, e interfaces rigorosamente testadas para acessibilidade.
Por fim, falando de viabilidade, o ganho operacional é imenso. O verdadeiro 'custo' que temos hoje é a ineficiência e a evasão dos alunos que desistem do serviço. O nosso retorno é eliminar horas de trabalho manual da coordenação e entregar um serviço escalável, pronto para abraçar os novos estudantes.
(4:00 - 5:00) O Fechamento e Chamada para Ação
Hoje, o diretor da Proest e a coordenação do NAC já validaram nossa ideia. Eles precisam disso. Nós já mapeamos todas as Histórias de Usuário, desenhamos a arquitetura do banco de dados e temos a interface pronta para ser codificada.
O MobiUFAL nasceu como uma iniciativa solidária, mas para crescer, ele precisa de infraestrutura tecnológica.
O Mobiliza não é apenas um aplicativo de agendamento. É sobre devolver o controle da própria rotina para o aluno com deficiência. É garantir que a UFAL seja, na prática, um espaço onde a inclusão funciona de forma eficiente, invisível e digna.
Muito obrigado!


```

Escreva o roteiro para um pitch de 5 minutos que deve apresentar a ideia e demonstrar o protótipo visual do app

Segue um rascunho bem feinho:

### Assistant

Com base no rascunho e em tudo que construímos até aqui, aqui está o roteiro refinado:

## Roteiro — Pitch AB1 · Mobiliza

**Tempo total: 5 minutos**

### PARTE 1 — A Dor · 0:00–1:00

Quando pensamos em vida universitária, pensamos em autonomia.

A liberdade de ir da biblioteca pro RU, do IC pra Reitoria, de explorar o campus sem depender de ninguém. Mas essa liberdade que a maioria de nós toma como garantida, para muitos estudantes aqui da UFAL, simplesmente não existe da mesma forma.

Alunos com deficiência física ou visual enfrentam barreiras reais todos os dias. E a UFAL reconhece isso — tanto que criou o MobiUFAL, um projeto que designa bolsistas treinados para auxiliar no deslocamento desses estudantes pelo campus. Uma iniciativa genuinamente nobre.

O problema é que a execução parou no tempo.

Sabe como um aluno com deficiência pede ajuda hoje?

*(pausa)*

Num grupo de WhatsApp.

Durante nossa pesquisa, ouvimos o relato de um estudante que conhece o MobiUFAL, está no grupo, valoriza o projeto — mas evita usar. Por quê? Porque ter que expor sua necessidade publicamente, para uma lista inteira de pessoas, tira exatamente o que ele mais busca: dignidade e autonomia.

E além do impacto humano, há um caos operacional silencioso. Tudo é manual. Os bolsistas reconstroem os atendimentos de cabeça, no fim de semana, revisando o histórico do grupo para preencher uma planilha. A Adriana, coordenadora do NAC, perde horas verificando se os dados fazem sentido. E a demanda só cresce — hoje são 9 alunos ativos para 7 bolsistas, e esse modelo não escala.

### PARTE 2 — A Solução · 1:00–2:30

Foi olhando para tudo isso que chegamos ao**Mobiliza**.

Não estamos propondo um ajuste no grupo de WhatsApp. Estamos propondo substituí-lo por uma plataforma completa, construída para cada um dos três lados desse serviço.

**Para o aluno com deficiência:**um aplicativo acessível — totalmente compatível com leitores de tela e resposta por áudio — onde ele solicita o deslocamento de forma privada, em segundos. Ele escolhe origem e destino, confirma, e acompanha o bolsista em tempo real. Sem grupo. Sem exposição.

*(mostrar tela de solicitação no protótipo)*

**Para o bolsista:**o app vira sua ferramenta de trabalho. Ele marca que está disponível no turno, recebe a notificação da solicitação, vê as informações do aluno — incluindo tipo de deficiência e preferências de atendimento — e aceita com um toque. Ao concluir, o atendimento é registrado automaticamente. Fim do preenchimento de planilha no domingo à noite.

*(mostrar tela do bolsista — disponibilidade e aceite)*

**Para a gestão do NAC:**um dashboard web em tempo real. A Adriana abre a tela na salinha da reitoria e enxerga exatamente quem está atendendo quem, quais solicitações estão pendentes, e gera relatórios completos em CSV com um clique — sem retrabalho, sem inconsistências.

*(mostrar dashboard)*

### PARTE 3 — Estrutura e Viabilidade · 2:30–4:00

Para garantir que essa ideia se sustenta na prática, estruturamos nossa operação com base no 5W2H.

**O quê:**um ecossistema de mobilidade interna, composto por app mobile e dashboard web.

**Por quê:**porque a UFAL precisa devolver dignidade ao aluno PcD, dar eficiência ao bolsista e gerar dados confiáveis para a instituição tomar decisões melhores.

**Quem:**os próprios alunos e bolsistas como usuários diretos, sob a gestão do NAC e da Proest — que já validaram a proposta e demonstraram interesse real em adotá-la.

**Onde:**em todo o Campus A.C. Simões, com os pontos de referência do campus mapeados dentro do sistema.

**Quando:**em tempo real. A necessidade do aluno e a disponibilidade do bolsista se encontram no exato momento do clique.

**Como:**com autenticação via e-mail institucional, interfaces testadas para acessibilidade e registro automático de cada atendimento — eliminando completamente o processo manual atual.

**Quanto custa:**o verdadeiro custo que existe hoje não é financeiro. É a ineficiência, o retrabalho e a evasão silenciosa de alunos que desistem do serviço por constrangimento. O Mobiliza elimina esse custo e entrega um sistema escalável, pronto para crescer junto com a demanda.

### PARTE 4 — Fechamento · 4:00–5:00

Hoje, o diretor da Proest e a coordenação do NAC já validaram nossa proposta. Eles precisam disso — e deixaram isso claro quando nos receberam.

Do nosso lado, já mapeamos todas as histórias de usuário, definimos a arquitetura do sistema e temos a interface pronta para ser codificada.

*(mostrar uma tela final do protótipo — sugestão: home do aluno)*

O MobiUFAL nasceu como um gesto de solidariedade. E esse gesto merece uma infraestrutura à altura.

O Mobiliza não é um aplicativo de agendamento. É sobre devolver o controle da própria rotina para quem mais precisa. É garantir que a inclusão na UFAL funcione de forma eficiente, discreta e digna — não apesar da tecnologia, mas por causa dela.

Obrigado.

### Notas de apresentação

**Divisão de fala sugerida para a equipe:**

- Integrante 1 — Parte 1 completa (a dor)
- Integrante 2 — Parte 2 completa (a solução + demo do protótipo)
- Integrante 3 — Parte 3 completa (estrutura e viabilidade)
- Integrante 1 ou líder — Parte 4 (fechamento)

**Durante a demo do protótipo:**Quem estiver apresentando a Parte 2 deve ter o Figma aberto no modo apresentação e navegar pelas telas enquanto fala — não depois. A demonstração deve ser fluida e parecer natural, não uma pausa na fala.

**Pontos de atenção no tempo:**Se sentir que está adiantado, expanda as pausas dramáticas e a navegação pelo protótipo. Se estiver atrasado, a Parte 3 é a que mais comporta cortes sem prejudicar o impacto geral.

### User

Reescreva o roteiro, não estou gostando da linguagem e do ritmo, além de citar coisas muito específicas.

Esse vídeo será avaliado pelos professores de outras equipes, que não tem conhecimento sobre o projeto. A ideia é gravar as falas e fazer um vídeo ilustrativo por cima, com inserts, trechos do protótipo no Figma e mais

### Assistant

## Roteiro — Pitch AB1 · Mobiliza

**Tempo total: 5 minutos**

### PARTE 1 — A Dor · 0:00–1:00

Pensa na sua rotina aqui na universidade.

Você vai do seu instituto pra biblioteca, passa pelo RU, atravessa o campus sem pensar duas vezes. Essa liberdade parece óbvia. Mas ela não é igual pra todo mundo.

Estudantes com deficiência física ou visual enfrentam barreiras reais todos os dias dentro do campus. E as universidades reconhecem isso — tanto que existem projetos institucionais criados especificamente para auxiliar no deslocamento dessas pessoas, conectando voluntários e bolsistas treinados a quem precisa de apoio.

A UFAL tem um projeto assim. Ele existe, funciona, e faz diferença na vida de muita gente.

O problema é que ele opera inteiramente por mensagens de WhatsApp.

*(pausa)*

O estudante abre o grupo, manda uma mensagem pedindo ajuda, e espera. Todo mundo no grupo vê. E durante nossa pesquisa, ouvimos de um aluno que ele evita usar o serviço por esse motivo. Não por falta de necessidade — mas porque expor sua vulnerabilidade num grupo tira exatamente o que ele mais busca.

Autonomia. E dignidade.

E o problema não para aí. Tudo é manual. Os registros são feitos de memória, às vezes dias depois. Os dados acumulam inconsistências. E a demanda só cresce — enquanto o modelo operacional continua o mesmo.

### PARTE 2 — A Solução · 1:00–2:30

Foi olhando para esse cenário que desenvolvemos o**Mobiliza**.

Uma plataforma completa que substitui o grupo de WhatsApp por um ecossistema pensado para cada pessoa envolvida nesse serviço.

**Para o estudante com deficiência**, desenvolvemos um aplicativo acessível — compatível com leitores de tela e resposta por áudio — onde ele solicita o deslocamento de forma completamente privada. Ele escolhe a origem, o destino, confirma, e acompanha o atendimento em tempo real. Sem grupo. Sem exposição.

*(insert: tela de solicitação no protótipo)*

**Para o bolsista**, o app funciona como ferramenta de trabalho. Ele indica quando está disponível, recebe as solicitações com todas as informações do estudante, aceita com um toque e, ao concluir o atendimento, o registro acontece automaticamente — sem precisar preencher nada depois.

*(insert: tela do bolsista)*

**Para a gestão**, desenvolvemos um dashboard web em tempo real. A coordenação consegue acompanhar os atendimentos em andamento, identificar solicitações sem resposta e gerar relatórios completos com um clique — substituindo completamente o processo manual de planilhas.

*(insert: dashboard)*

Três interfaces. Um problema resolvido.

### PARTE 3 — Estrutura e Viabilidade · 2:30–4:00

Para garantir que essa solução se sustenta na prática, estruturamos o projeto com base no 5W2H.

**O quê:**uma plataforma de mobilidade assistida, composta por aplicativo mobile e dashboard web.

**Por quê:**porque esse serviço precisa de uma infraestrutura que respeite quem usa, alivie quem executa e dê visibilidade para quem gerencia.

**Quem:**os próprios estudantes e bolsistas como usuários diretos, com a coordenação institucional responsável pela gestão — que já validou a proposta e demonstrou interesse real em adotá-la.

**Onde:**no campus universitário, com os pontos de referência mapeados dentro do sistema.

**Quando:**em tempo real. A necessidade de quem solicita e a disponibilidade de quem atende se encontram no momento do clique.

**Como:**com autenticação via e-mail institucional, interfaces testadas para acessibilidade e registro automático de cada atendimento.

**Quanto custa:**o verdadeiro custo que existe hoje não é financeiro. É o retrabalho, a ineficiência e a evasão silenciosa de quem desiste do serviço. O Mobiliza elimina esse custo e entrega algo que escala.

### PARTE 4 — Fechamento · 4:00–5:00

A proposta já foi apresentada para a coordenação institucional responsável pelo serviço. A recepção foi positiva — eles enxergaram valor imediato na solução.

Do nosso lado, as histórias de usuário estão mapeadas, a arquitetura está definida e a interface está pronta para ser desenvolvida.

*(insert: telas do protótipo)*

Projetos como esse nascem como um gesto de solidariedade. E gestos assim merecem uma infraestrutura à altura.

O Mobiliza não é só um aplicativo. É sobre garantir que inclusão não seja apenas uma intenção — mas algo que funciona, todo dia, para quem mais precisa.

Obrigado.

### Notas de produção

**Linguagem visual sugerida por trecho:**

- Parte 1 → imagens do campus, calçadas, pessoas se deslocando, capturas de grupos de WhatsApp genéricos
- Parte 2 → navegação fluida pelo protótipo no Figma, uma tela por vez, acompanhando o ritmo da fala
- Parte 3 → motion simples com os tópicos do 5W2H aparecendo enquanto são citados
- Parte 4 → retorno ao protótipo, tela final limpa, fade out

**Ritmo de fala:**O roteiro foi escrito para ser falado com calma. Frases curtas pedem pausas curtas. As pausas marcadas pedem pelo menos dois segundos de silêncio — elas são intencionais e têm mais impacto do que parecem no papel.

### User

Me mostre um mockup de como você acha que deveria ser a tela do aluno bolsista onde os pedidos de deslocamento são exibidos

### Assistant

V
Conectando a visualize...
Algumas decisões de design que vale destacar:

O card de solicitação pendente usa uma borda âmbar para criar urgência visual sem ser agressivo — o bolsista precisa identificar rapidamente que há algo esperando por ele. O indicador de tempo "há 2 min" reforça essa sensação.

O card de observações em destaque com o aviso de áudio descrição é intencional — essa informação precisa aparecer antes do aceite, não depois. No caso de usuários com deficiência visual, ignorar isso no percurso é um erro grave.

O atendimento já concluído aparece logo abaixo com badge verde e informações compactas, dando ao bolsista um histórico imediato do dia sem precisar sair da tela.

O toggle de disponibilidade no header foi mantido sempre visível porque é a ação mais crítica do fluxo — um bolsista que esquece de se marcar disponível simplesmente não recebe solicitações.

### User

Ao aceitar o atendimento, o que deveria ser exibido?

### Assistant

V
Conectando a visualize...
Algumas decisões que valem destaque:

O cronômetro é funcional e roda em tempo real — no Figma você vai simular isso com um número estático, mas é importante comunicar ao avaliador que esse elemento é dinâmico.

O lembrete de áudio descrição aparece com destaque em azul porque é uma instrução de conduta, não apenas uma informação — o bolsista precisa ser lembrado ativamente disso antes e durante o percurso, especialmente no caso de usuários com deficiência visual.

O botão "Reportar problema" existe mas é secundário e visualmente mais discreto — ele é para situações como o aluno não aparecer no ponto combinado ou um obstáculo intransponível no caminho, e não deve competir visualmente com o fluxo principal de conclusão.

"Concluir atendimento" é o único elemento com peso visual forte na parte inferior — é a ação que o bolsista vai fazer com a tela na mão, provavelmente com uma das mãos ocupada, então o alvo de toque grande é intencional.

### User

Me mostre um mockup de como você acha que deveria ser a dashboard web para gestão

### Assistant

V
Conectando a visualize...
Algumas decisões que valem atenção para o Figma:

O alerta amarelo no topo do conteúdo é a decisão mais importante da tela — uma solicitação sem resposta precisa aparecer de forma proativa para a Adriana, sem que ela precise procurar. Esse padrão resolve diretamente a causa C3 que levantamos no Ishikawa.

O painel de status dos bolsistas usa três estados visuais distintos — em atendimento (verde), disponível (azul) e offline (cinza) — com badges que permitem leitura rápida sem precisar decodificar nada. A Adriana precisa entender a situação em segundos.

O gráfico de demanda por horário é simples e intencional — barras horizontais em vez de um gráfico elaborado, porque o objetivo é identificar picos rapidamente, não analisar tendências complexas. O horário das 10h como maior barra confirma o que a própria coordenação do NAC observa no dia a dia.

As rotas mais solicitadas no card inferior direito são um dado que o sistema atual simplesmente não consegue gerar — elas emergem naturalmente dos registros automáticos, e vão ter um valor enorme para o NAC tomar decisões sobre alocação de bolsistas por região do campus.

### User

Como seria a página de atendimentos da dashboard?

### Assistant

V
Conectando a visualize...
Algumas decisões que valem destaque para quando você replicar no Figma:

O painel de detalhe lateral é aberto ao clicar em qualquer linha da tabela — a linha selecionada fica destacada em azul claro para indicar o vínculo. Esse padrão evita navegação para uma página separada e mantém a Adriana no contexto da lista enquanto analisa um registro específico.

O histórico com o aluno no rodapé do painel de detalhe é um dado que o sistema atual simplesmente não consegue gerar — e é exatamente o tipo de informação que ajuda a identificar padrões, como um aluno que faz a mesma rota todos os dias no mesmo horário.

A linha vermelha "Não atendido" do dia 23/04 é deliberadamente discreta na tabela, mas imediatamente legível pelo badge — a Adriana precisa conseguir filtrar essas ocorrências rapidamente para entender se há um problema recorrente de cobertura em algum turno específico.

Os três KPIs no topo (total, tempo médio e não atendidos) mudam conforme os filtros de período e bolsista — no Figma, vale criar variantes dos componentes para simular essa interação durante a apresentação.

### User

Como seria a página de bolsistas na dashboard?

### Assistant

V
Conectando a visualize...
Algumas decisões que merecem atenção ao replicar no Figma:

O card da Carla Matos com status "Pendente" tem uma lógica visual diferente dos demais — em vez de barras de progresso, exibe o contexto do cadastro e dois botões de ação direta. Isso porque a Adriana não precisa de métricas de quem ainda não começou, precisa tomar uma decisão. O botão "Aprovar" recebe o peso visual maior propositalmente.

As barras de progresso dentro de cada card usam o mesmo bolsista mais ativo como referência máxima — assim a Adriana consegue comparar a produção relativa entre eles de relance, sem precisar abrir o detalhe de cada um.

O painel lateral exibe o gráfico de atendimentos por semana, os alunos mais atendidos e as rotas mais frequentes daquele bolsista específico — são dados que revelam vínculos e padrões que o sistema atual nunca conseguiria gerar, como perceber que um bolsista atende sempre os mesmos alunos nas mesmas rotas, o que pode informar decisões de alocação por turno.

### User

Como seria a página de alunos na dashboard?

### Assistant

::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation-duration: 0.25s;
    animation-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
  }
V
visualize
V
visualizeshow_widget
Algumas decisões que merecem destaque para o Figma:

A coluna "bolsista usual" na tabela é um dado que emerge naturalmente dos registros automáticos e que o sistema atual nunca conseguiria gerar. Ela revela vínculos implícitos — como o fato de que a Maria Aparecida foi atendida 22 das 31 vezes pelo mesmo bolsista — e pode informar decisões de alocação por afinidade ou adaptação ao aluno.

A Laura Costa aparece com dois badges de deficiência simultaneamente porque tem deficiência múltipla. Esse caso precisa de uma representação visual cuidadosa no Figma — dois tags lado a lado são mais legíveis do que tentar comprimir tudo num único texto.

O campo de observações no painel lateral é deliberadamente o primeiro item de conteúdo após os KPIs, antes das rotas e do histórico. Isso porque para a Adriana e especialmente para os bolsistas que forem consultar esse registro, as observações sobre como atender aquela pessoa específica são a informação mais crítica — elas precisam ser vistas antes de qualquer número.

A coluna "último atendimento" usa linguagem relativa — "hoje", "ontem", "23/04" — em vez de timestamps absolutos, porque o que importa para a Adriana é saber quem está ativo recentemente e quem pode estar sem usar o serviço há um tempo.

### User

Como seria a página de relatórios na dashboard?

### Assistant

::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation-duration: 0.25s;
    animation-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
  }
V
visualize
V
visualizeshow_widget

### User

Como seria a página de configurações na dashboard?

