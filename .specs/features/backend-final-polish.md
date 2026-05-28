# Spec: Backend Final Polish

## Status: ✅ CONCLUÍDO

**Data:** 27 de Maio 2026

## 1. Visão Geral
Implementação das últimas funcionalidades de negócio faltantes no backend para entregar 100% dos épicos exigidos pelo backlog.

## 2. Requisitos (User Stories)
- **US-07 (Rotas Frequentes):** ✅ Implementado. Tabela `favorite_route` criada, router `favorites` funcional.
- **US-11 (Histórico do Bolsista):** ✅ Implementado. Função `getScholarHistory` adicionada ao `requestsRouter`.
- **US-10 (Exportação de Planilha):** ✅ Implementado. Função `generateAttendanceReportCSV` adicionada ao `metricsRouter`.
- **US-09 (Notificação de Timeout):** ✅ Implementado. Endpoint `/api/cron/check-timeouts` criado para disparar alertas.

## 3. Arquitetura
Seguindo a Clean Architecture:
- `packages/contracts`: Schemas de validação Zod extraídos.
- `packages/domain`: Lógica de negócio pura e erros.
- `packages/db`: Migrations e schema do Drizzle atualizados.
- `apps/api`: Orquestração (tRPC) e endpoint Cron REST.

## 4. Task Breakdown (TDD)
| Task | O que | Camada | Status |
|---|---|---|---|
| T1.1 | Criar tabela `favorite_route` e relations | DB | ✅ DONE |
| T1.2 | Criar schemas Zod para rotas frequentes | Contracts | ✅ DONE |
| T1.3 | Criar domain logic `createFavoriteRoute`, `deleteFavoriteRoute` | Domain | ✅ DONE |
| T1.4 | Criar `favorites.ts` router e integrar | API | ✅ DONE |
| T2.1 | Criar schema e função domain `getScholarHistory` | Contracts/Domain | ✅ DONE |
| T2.2 | Integrar `scholarHistory` ao `requestsRouter` | API | ✅ DONE |
| T3.1 | Criar função domain `generateAttendanceReportCSV` | Domain | ✅ DONE |
| T3.2 | Integrar `exportCSV` ao `metricsRouter` | API | ✅ DONE |
| T4.1 | Criar endpoint `/api/cron/check-timeouts` (Hono) e lógica domain | API/Domain | ✅ DONE |
| T5.1 | Validação final: Testes, Typecheck, Lint | Cross-cutting | ✅ DONE |
