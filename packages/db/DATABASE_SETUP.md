# Database Setup Guide: Drizzle ORM + PostgreSQL (NeonDB)

## Overview

O Mobiliza agora usa **Drizzle ORM** para acesso ao banco de dados, com suporte para **PostgreSQL** via **NeonDB** (ou qualquer outro servidor PostgreSQL).

A camada de persistência está totalmente separada da lógica de negócio, permitindo que você mude o banco de dados sem afetar o código da aplicação.

## Quick Start

### 1. Criar um banco de dados NeonDB

1. Acesse [console.neon.tech](https://console.neon.tech)
2. Crie um novo projeto PostgreSQL
3. Copie a connection string (DATABASE_URL)

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
DATABASE_URL=postgresql://username:password@project-region.neon.tech/dbname
PORT=3001
NODE_ENV=development
```

### 3. Gerar migrations (se mudou o schema)

```bash
cd packages/db
pnpm run generate
```

Isso criará um arquivo de migration em `packages/db/migrations/`.

### 4. Iniciar a aplicação

```bash
pnpm dev
```

A aplicação irá conectar automaticamente ao PostgreSQL e usar Drizzle para todas as operações.

## Estrutura do Database Layer

```
packages/db/
├── src/
│   ├── schema.ts          # Definição das tabelas Drizzle
│   ├── client.ts          # Factory para criar DatabaseClient
│   ├── repositories.ts    # Implementação dos repositories com Drizzle
│   ├── env.ts             # Validação de variáveis de ambiente
│   └── index.ts           # Exports públicos
├── migrations/            # Migrações Drizzle (geradas automaticamente)
├── drizzle.config.ts      # Configuração Drizzle Kit
└── package.json           # Scripts de migração
```

## Arquitetura

A aplicação mantém a separação de camadas:

```
API Routes (apps/api/src/routes/)
    ↓
Domain Logic (packages/domain/)
    ↓
Repositories (packages/db/src/repositories.ts)
    ↓
Drizzle ORM → PostgreSQL
```

### DatabaseClient

O `DatabaseClient` é o ponto de entrada para a persistência:

```typescript
interface DatabaseClient {
  requests: RequestRepository;
  db: DrizzleDatabase;
  connection: PostgresConnection;
}
```

### RequestRepository

Implementa a interface `RequestRepository` do domain:

```typescript
interface RequestRepository {
  list(): Promise<RequestRecord[]>;
  create(request: RequestRecord): Promise<RequestRecord>;
}
```

## Executar Queries Diretamente

Se precisar executar queries customizadas, você pode acessar o objeto Drizzle:

```typescript
import { getDatabaseClient } from "@mobiliza/db";
import { requests } from "@mobiliza/db";

const { db } = getDatabaseClient();

// Query com Drizzle
const allRequests = await db.select().from(requests);

// Query com SQL raw
const result = await db.execute("SELECT * FROM requests WHERE status = 'completed'");
```

## Próximas Etapas

### Adicionar mais repositories

Se precisar de outro repository (ex: assistants, availability), siga o padrão:

1. Adicione uma tabela em `schema.ts`
2. Crie uma função `createXyzRepository` em `repositories.ts`
3. Adicione ao `DatabaseClient` em `client.ts`
4. Use em `packages/domain` e `apps/api`

### Configurar Replicação (Production)

Para production com NeonDB:

1. Ative branching para staging
2. Configure read replicas se necessário
3. Use connection pooling via PgBouncer

### Monitoramento

Drizzle logs queries em modo verbose. Para desabilitar:

```typescript
// Em client.ts
const db = drizzle(connection, { schema, logger: false });
```

## Troubleshooting

### "DATABASE_URL environment variable is not set"

Certifique-se de que `.env` existe na raiz do projeto com `DATABASE_URL` preenchido.

### Timeout na conexão

Se está usando NeonDB, certifique-se de que:
- A connection string está correta
- Sua função/lambda tem timeout suficiente
- NeonDB pode aceitar conexões de seu IP

### Erros de tipo no TypeScript

Regenere as migrações:

```bash
cd packages/db
pnpm run generate
```

## Referências

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle PostgreSQL Docs](https://orm.drizzle.team/docs/get-started-postgresql)
- [NeonDB Documentation](https://neon.tech/docs)
- [Mobiliza Architecture](../../gpt.md)
