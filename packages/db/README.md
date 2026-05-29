<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../../.github/db.png">
  <source media="(prefers-color-scheme: light)" srcset="../../.github/db.png">
  <img alt="Capa do projeto Mobiliza" src="../../.github/db.png">
</picture>

## Banco de dados

O pacote `@mobiliza/db` concentra a camada de persistência do Mobiliza. Ele organiza a conexão com PostgreSQL e a modelagem com Drizzle ORM.

### Visão geral do fluxo

O pacote segue um ciclo simples:

```mermaid
flowchart TD
  A[Configurar o ambiente] --> B[Editar o schema em src/schema]
  B --> C[Gerar migrações com db:generate]
  C --> D[Aplicar migrações com db:migrate]
  D --> E[Validar no banco]
  E --> F[Usar db:studio para inspeção]
```

1. configurar o ambiente com `DATABASE_URL` e as variáveis compartilhadas em `@mobiliza/env`
2. definir ou ajustar o schema em `src/schema`
3. gerar os arquivos de migração com `db:generate`
4. aplicar as migrações no banco com `db:migrate`
5. usar `db:push` apenas em cenários de sincronização rápida durante desenvolvimento
6. abrir a interface visual do Drizzle com `db:studio` quando for útil inspecionar tabelas e dados

Esse fluxo evita que as aplicações consumam detalhes de infraestrutura diretamente e mantém o acesso ao banco centralizado neste pacote.

### Responsabilidades

* configurar a conexão com o banco
* manter o schema do projeto
* expor client e helpers de acesso
* oferecer comandos de geração, migração e inspeção

### Exports públicos

* `@mobiliza/db`
* `@mobiliza/db/schema`
* `@mobiliza/db/drizzle`
* `@mobiliza/db/client`

### Scripts disponíveis

Os scripts abaixo devem ser executados dentro do pacote `packages/db`, com as dependências já instaladas no monorepo.

```bash
pnpm --filter @mobiliza/db db:generate
pnpm --filter @mobiliza/db db:migrate
pnpm --filter @mobiliza/db db:push
pnpm --filter @mobiliza/db db:studio
```

| Script | O que faz | Quando usar |
| --- | --- | --- |
| `db:generate` | Cria arquivos de migração a partir do schema atual do Drizzle | Sempre que o schema mudar e a alteração precisar ficar versionada |
| `db:migrate` | Aplica as migrações geradas ao banco apontado por `DATABASE_URL` | Em homologação, produção e fluxos controlados |
| `db:push` | Envia o schema diretamente ao banco sem passar por migração | Só em desenvolvimento local, quando velocidade importa mais que histórico |
| `db:studio` | Abre a interface do Drizzle para explorar tabelas, colunas e registros | Para inspeção visual, debugging e conferência de dados |

### Como executar na prática

#### 1. Configurar o ambiente

Antes de rodar qualquer script, garanta que o banco de dados esteja acessível e que o projeto tenha as variáveis esperadas por `@mobiliza/env`. Na prática, isso significa definir `DATABASE_URL` e carregar qualquer variável complementar usada pelo monorepo.

```env
DATABASE_URL=postgresql://user:password@localhost:5432/mobiliza
```

#### 2. Preparar o schema

Todo ajuste estrutural do banco deve começar no diretório `src/schema`. É ali que as tabelas, enums, relações e demais definições do Drizzle ficam concentradas.

```ts
// Exemplo conceitual
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
});
```

#### 3. Gerar a migração

Depois de alterar o schema, execute `pnpm db:generate` para materializar a diferença entre o estado atual do código e o estado anterior do banco em arquivos de migração versionados.

Isso normalmente produz arquivos em uma pasta de migrações do Drizzle, que devem ser revisados antes do deploy.

#### 4. Aplicar a migração

Com a migração criada e revisada, rode `pnpm db:migrate` para aplicar as mudanças no PostgreSQL. Esse é o caminho recomendado para ambientes compartilhados, homologação e produção.

```bash
pnpm --filter @mobiliza/db db:migrate
```

#### 5. Sincronizar rapidamente em desenvolvimento

Se você estiver iterando localmente e quiser refletir o schema direto no banco sem manter um arquivo de migração, use `pnpm db:push`. Esse comando é mais rápido, mas sacrifica o histórico formal das migrações; por isso, não deve ser o caminho padrão fora do desenvolvimento.

```bash
pnpm --filter @mobiliza/db db:push
```

#### 6. Inspecionar o banco

Quando precisar validar estrutura, conferir dados ou depurar alguma tabela, use `pnpm db:studio`. O Studio é útil para checar o resultado das migrações sem escrever queries manualmente.

```bash
pnpm --filter @mobiliza/db db:studio
```

### Sequência recomendada para começar do zero

Se o banco ainda não estiver preparado, a ordem mais segura é:

1. configurar `DATABASE_URL`
2. confirmar que o schema do pacote está completo
3. executar `pnpm db:generate`
4. revisar os arquivos gerados
5. executar `pnpm db:migrate`
6. validar o resultado com `pnpm db:studio`

### Quando usar cada comando

| Situação | Comando recomendado |
| --- | --- |
| O schema mudou e você quer versionar a alteração | `db:generate` |
| A migração já foi revisada e precisa ir para o banco | `db:migrate` |
| Você quer testar uma mudança rápido na máquina local | `db:push` |
| Você quer navegar no banco com interface visual | `db:studio` |

### Configuração

Este pacote depende de `DATABASE_URL` e de variáveis compartilhadas em `@mobiliza/env`.

### Observação

O ideal é que as aplicações consumam este pacote apenas para persistência, mantendo a lógica de negócio fora dele.