/**
 * Helpers de seed para testes com banco Neon real.
 * Cada funcao insere dados no banco e retorna o objeto criado.
 * As operacoes sao parte da transaction do teste - rollback desfaz tudo.
 */

import { sql } from "drizzle-orm";
import {
  user,
  studentProfile,
  scholarProfile,
  campusLocation,
  serviceRequest,
  serviceAttendance,
  notification,
  studentDisability,
} from "@mobiliza/db/schema";
// Use the same db instance as routers (mocked in tests via @mobiliza/db/client mapping)
import { db } from "@mobiliza/db/client";

// Use db from @mobiliza/db/client (mocked in tests)
// All seed operations use the same mocked db as the routers under test

// ─── User ─────────────────────────────────────────────────────────────────────

export async function seedUser(
  overrides: Partial<{
    id: string;
    name: string;
    email: string;
    role: "student" | "scholar" | "manager";
    createdAt?: Date;
  }> = {}
) {
  const { id, name, email, role = "student", createdAt } = overrides;
  const uniqueSuffix = crypto.randomUUID().slice(0, 8);
  const [created] = await db
    .insert(user)
    .values({
      id: id ?? crypto.randomUUID(),
      name: name ?? "Test User",
      email: email ?? `test_${uniqueSuffix}@example.com`,
      emailVerified: true,
      role,
      createdAt: createdAt ?? new Date(),
    })
    .returning();
  return created;
}

// ─── Student Profile ──────────────────────────────────────────────────────────

export async function seedStudentProfile(
  userId: string,
  overrides: Partial<{
    enrollment: string;
    course: string;
    campus: string;
    phone: string;
    shift: string;
    gender: string;
    isActive: boolean;
    createdAt?: Date;
  }> = {}
) {
  const { createdAt } = overrides;
  const uniqueSuffix = crypto.randomUUID().slice(0, 8);
  const [created] = await db
    .insert(studentProfile)
    .values({
      id: crypto.randomUUID(),
      userId,
      enrollment: overrides.enrollment ?? `2024${uniqueSuffix}`,
      course: (overrides.course ?? "Ciência da Computação") as "Ciência da Computação" | "Pedagogia" | "Engenharia Civil" | "Direito" | "Medicina",
      campus: (overrides.campus ?? "Campus A.C. Simões") as "Campus A.C. Simões" | "Campus CECA" | "Campus Arapiraca" | "Campus Sertão",
      phone: overrides.phone ?? "82111113333",
      shift: (overrides.shift ?? "morning") as "morning" | "afternoon" | "night",
      gender: (overrides.gender ?? "male") as "male" | "female" | "non_binary" | "prefer_not_to_say",
      isActive: overrides.isActive ?? true,
      createdAt: createdAt ?? new Date(),
    })
    .returning();
  return created;
}

// ─── Scholar Profile ──────────────────────────────────────────────────────────

export async function seedScholarProfile(
  userId: string,
  overrides: Partial<{
    enrollment: string;
    course: string;
    campus: string;
    phone: string;
    cpf: string;
    shift: string;
    isApproved: boolean;
    isAvailable: boolean;
    isActive: boolean;
    createdAt?: Date;
  }> = {}
) {
  const { createdAt } = overrides;
  const uniqueSuffix = crypto.randomUUID().slice(0, 8);
  const [created] = await db
    .insert(scholarProfile)
    .values({
      id: crypto.randomUUID(),
      userId,
      enrollment: overrides.enrollment ?? `2024${uniqueSuffix}`,
      course: (overrides.course ?? "Ciência da Computação") as "Ciência da Computação" | "Pedagogia" | "Engenharia Civil" | "Direito" | "Medicina",
      campus: (overrides.campus ?? "Campus A.C. Simões") as "Campus A.C. Simões" | "Campus CECA" | "Campus Arapiraca" | "Campus Sertão",
      phone: overrides.phone ?? "82111112222",
      cpf: overrides.cpf ?? `${uniqueSuffix}`.padEnd(11, '0').slice(0, 11),
      shift: (overrides.shift ?? "morning") as "morning" | "afternoon" | "night",
      isApproved: overrides.isApproved ?? false,
      isAvailable: overrides.isAvailable ?? false,
      isActive: overrides.isActive ?? true,
      createdAt: createdAt ?? new Date(),
    })
    .returning();
  return created;
}

// ─── Campus Location ────────────────────────────────────────────────────────────

export async function seedCampusLocation(
  overrides: Partial<{
    name: string;
    abbreviation: string;
    latitude: number;
    longitude: number;
    isActive: boolean;
    createdAt?: Date;
  }> = {}
) {
  const { createdAt } = overrides;
  const [created] = await db
    .insert(campusLocation)
    .values({
      name: overrides.name ?? "Bloco de Aulas",
      abbreviation: overrides.abbreviation ?? "BLA",
      latitude: overrides.latitude ?? -9,
      longitude: overrides.longitude ?? -35,
      isActive: overrides.isActive ?? true,
      createdAt: createdAt ?? new Date(),
    })
    .returning();
  return created;
}

// ─── Service Request ────────────────────────────────────────────────────────────

export async function seedServiceRequest(
  studentProfileId: string,
  overrides: Partial<{
    originLocationId: number;
    destinationLocationId: number;
    status: string;
    notes: string | null;
    createdAt?: Date;
  }> = {}
) {
  const { createdAt } = overrides;
  let originId = overrides.originLocationId;
  let destId = overrides.destinationLocationId;

  if (!originId || !destId) {
    const locs = await db.select().from(campusLocation).limit(2);
    originId = originId ?? (locs[0] as any)?.id ?? 1;
    destId = destId ?? (locs[1] as any)?.id ?? 2;
  }

  const [created] = await db
    .insert(serviceRequest)
    .values({
      id: crypto.randomUUID(),
      studentProfileId,
      originLocationId: originId,
      destinationLocationId: destId,
      status: (overrides.status ?? "pending") as "pending" | "accepted" | "ongoing" | "completed" | "cancelled",
      notes: overrides.notes ?? null,
      createdAt: createdAt ?? new Date(),
      updatedAt: createdAt ?? new Date(),
    } as typeof serviceRequest.$inferInsert)
    .returning();
  return created;
}

// ─── Service Attendance ────────────────────────────────────────────────────────────

export async function seedServiceAttendance(
  requestId: string,
  scholarProfileId: string,
  overrides: Partial<{
    acceptedAt: Date;
    startedAt: Date | null;
    completedAt: Date | null;
    durationSeconds: number | null;
    rating: number | null;
    ratingComment: string | null;
    createdAt?: Date;
  }> = {}
) {
  const { createdAt } = overrides;
  const [created] = await db
    .insert(serviceAttendance)
    .values({
      id: crypto.randomUUID(),
      requestId,
      scholarProfileId,
      acceptedAt: overrides.acceptedAt ?? new Date(),
      startedAt: overrides.startedAt ?? null,
      completedAt: overrides.completedAt ?? null,
      durationSeconds: overrides.durationSeconds ?? null,
      rating: overrides.rating ?? null,
      ratingComment: overrides.ratingComment ?? null,
      createdAt: createdAt ?? new Date(),
    })
    .returning();
  return created;
}

// ─── Notification ────────────────────────────────────────────────────────────

export async function seedNotification(
  userId: string,
  overrides: Partial<{
    type: string;
    title: string;
    body: string;
    resourceId: string | null;
    readAt: Date | null;
  }> = {}
) {
  const [created] = await db
    .insert(notification)
    .values({
      id: crypto.randomUUID(),
      userId,
      type: (overrides.type ?? "new_request_available") as any,
      title: overrides.title ?? "Nova solicitacao",
      body: overrides.body ?? "Uma nova solicitacao foi criada",
      resourceId: overrides.resourceId ?? null,
      readAt: overrides.readAt ?? null,
    })
    .returning();
  return created;
}

// ─── Student Disability ─────────────────────────────────────────────────────────

export async function seedStudentDisability(
  studentProfileId: string,
  overrides: Partial<{
    disabilityType: string;
  }> = {}
) {
  const [created] = await db
    .insert(studentDisability)
    .values({
      id: crypto.randomUUID(),
      studentProfileId,
      disabilityType: (overrides.disabilityType ?? "physical_disability") as any,
    })
    .returning();
  return created;
}

// ─── Cleanup helper ────────────────────────────────────────────────────────────

export async function clearTable(tableName: string): Promise<void> {
  await db.execute(sql`DELETE FROM ${sql.identifier(tableName)}`);
}
