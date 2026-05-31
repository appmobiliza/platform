/**
 * Generators de dados para o seeder.
 *
 * Cada generator é responsável por criar registros de uma entidade
 * específica no banco de dados, usando o Faker para dados realistas.
 *
 * ─── Ordem de Execução (dependências) ───────────────────────────────────
 *
 * 1. locations     → campus_location (sem dependências)
 * 2. users         → user (Better Auth)
 * 3. students      → student_profile + student_disability
 * 4. scholars      → scholar_profile
 * 5. managers      → user (role: manager)
 * 6. requests      → service_request + service_attendance
 *
 * ─── Implementação Futura ────────────────────────────────────────────────
 *
 * Cada generator abaixo será implementado em tasks separadas, seguindo
 * TDD (RED → GREEN → REFACTOR) e Clean Architecture.
 *
 * import { locationGenerator } from "./locations";
 * import { userGenerator } from "./users";
 * import { studentGenerator } from "./students";
 * import { scholarGenerator } from "./scholars";
 * import { managerGenerator } from "./managers";
 * import { requestGenerator } from "./requests";
 *
 * export const generators = [
 *   locationGenerator,
 *   userGenerator,
 *   studentGenerator,
 *   scholarGenerator,
 *   managerGenerator,
 *   requestGenerator,
 * ];
 */

export {};
