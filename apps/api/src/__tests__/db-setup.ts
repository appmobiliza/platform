/**
 * db-setup.ts - Mantido para compatibilidade com imports antigos.
 *
 * As-funcoes re-exportadas de setup.ts.
 * Os hooks reales estao em setup.ts via beforeAll/afterAll/afterEach.
 */

export { getDb, rollbackTransaction } from "./setup";
