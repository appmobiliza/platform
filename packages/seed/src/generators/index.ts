/**
 * Generators de dados para o seeder.
 *
 * Cada generator segue a interface SeedGenerator e é responsável
 * por criar registros de uma entidade específica.
 *
 * ─── Ordem de Execução (respeita dependências) ──────────────────────────
 *
 * 1. locations   → campus_location     (sem dependências)
 * 2. users       → user                (sem dependências)
 * 3. students    → student_profile     (depende: users)
 *    + student_disability + favorite_route
 * 4. scholars    → scholar_profile     (depende: users)
 * 5. requests    → service_request     (depende: locations, students, scholars)
 *    + service_attendance
 */

import type { SeedGenerator } from "../lib/types";
import { locationGenerator } from "./locations";
import { requestGenerator } from "./requests";
import { scholarGenerator } from "./scholars";
import { studentGenerator } from "./students";
import { userGenerator } from "./users";

/**
 * Lista completa de generators na ordem correta de execução.
 * A ordem respeita as dependências entre entidades.
 */
export const generators: SeedGenerator[] = [
	locationGenerator,
	userGenerator,
	studentGenerator,
	scholarGenerator,
	requestGenerator,
];

export { locationGenerator } from "./locations";
export { requestGenerator } from "./requests";
export { scholarGenerator } from "./scholars";
export { studentGenerator } from "./students";
export { userGenerator } from "./users";
