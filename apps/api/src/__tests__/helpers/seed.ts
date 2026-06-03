/**
 * Helpers de seed para testes com banco Neon real.
 * Cada funcao insere dados no banco e retorna o objeto criado.
 * As operacoes sao parte da transaction do teste - rollback desfaz tudo.
 */

// Use the same db instance as routers (mocked in tests via @mobiliza/db/client mapping)
import { db } from "@mobiliza/db/client";
import type {
  CampusLocation,
  NewCampusLocation,
  NewNotification,
  NewScholarProfile,
  NewServiceAttendance,
  NewServiceRequest,
  NewStudentDisability,
  NewStudentProfile,
  NewUser,
  Notification,
  ScholarProfile,
  ServiceAttendance,
  ServiceRequest,
  StudentDisability,
  StudentProfile,
  User,
} from "@mobiliza/db/schema";
import {
  campusLocation,
  notification,
  scholarProfile,
  serviceAttendance,
  serviceRequest,
  studentDisability,
  studentProfile,
  user,
} from "@mobiliza/db/schema";
import { sql } from "drizzle-orm";
import { uuidv7 } from "uuidv7";

// Use db from @mobiliza/db/client (mocked in tests)
// All seed operations use the same mocked db as the routers under test

// ─── User ─────────────────────────────────────────────────────────────────────

export async function seedUser(
  overrides: Partial<NewUser> = {},
): Promise<User> {
  const uniqueId = uuidv7();
  const randomSuffix = Math.floor(Math.random() * 1000000);
  const [created] = await db
    .insert(user)
    .values({
      id: uniqueId,
      name: "Test User",
      email: `test_${uniqueId}_${randomSuffix}@example.com`,
      emailVerified: true,
      role: "student",
      ...overrides,
    })
    .returning();
  return created;
}

// ─── Student Profile ──────────────────────────────────────────────────────────

export async function seedStudentProfile(
  userId: string,
  overrides: Partial<NewStudentProfile> = {},
): Promise<StudentProfile> {
  const uniqueId = uuidv7();
  const [created] = await db
    .insert(studentProfile)
    .values({
      id: uniqueId,
      userId,
      enrollment: `ENROLL_${uniqueId}`,
      course: "Ciência da Computação",
      campus: "Campus A.C. Simões",
      phone: "82111113333",
      shift: "morning",
      gender: "male",
      nickname: null,
      attendanceNotes: null,
      simplifiedInterface: false,
      isActive: true,
      ...overrides,
    })
    .returning();
  return created;
}

// ─── Scholar Profile ──────────────────────────────────────────────────────────

export async function seedScholarProfile(
  userId: string,
  overrides: Partial<NewScholarProfile> = {},
): Promise<ScholarProfile> {
  const uniqueId = uuidv7();
  const cpfSuffix = Math.floor(Math.random() * 10000000000).toString().padStart(11, "0");
  const [created] = await db
    .insert(scholarProfile)
    .values({
      id: uniqueId,
      userId,
      enrollment: `SCHOLAR_${uniqueId}`,
      course: "Ciência da Computação",
      campus: "Campus A.C. Simões",
      phone: "82111112222",
      cpf: cpfSuffix,
      shift: "morning",
      isApproved: false,
      approvedAt: null,
      approvedBy: null,
      isAvailable: false,
      isActive: true,
      ...overrides,
    })
    .returning();
  return created;
}

// ─── Campus Location ────────────────────────────────────────────────────────────

export async function seedCampusLocation(
  overrides: Partial<NewCampusLocation> = {},
): Promise<CampusLocation> {
  const [created] = await db
    .insert(campusLocation)
    .values({
      id: uuidv7(),
      name: "Bloco de Aulas",
      abbreviation: "BLA",
      description: "Bloco principal de aulas",
      latitude: -9,
      longitude: -35,
      isActive: true,
      ...overrides,
    })
    .returning();
  return created;
}

// ─── Service Request ────────────────────────────────────────────────────────────

export async function seedServiceRequest(
  studentProfileId: string,
  overrides: Partial<NewServiceRequest> = {},
): Promise<ServiceRequest> {
  let originId = overrides.originLocationId;
  let destinationId = overrides.destinationLocationId;

  if (!originId) {
    const loc = await seedCampusLocation({ name: "Default Origin" });
    originId = loc.id;
  }
  if (!destinationId) {
    const loc = await seedCampusLocation({ name: "Default Destination" });
    destinationId = loc.id;
  }

  const [created] = await db
    .insert(serviceRequest)
    .values({
      id: uuidv7(),
      studentProfileId,
      originLocationId: originId,
      destinationLocationId: destinationId,
      status: "pending",
      notes: null,
      respondedAt: null,
      ...overrides,
    })
    .returning();
  return created;
}

// ─── Service Attendance ────────────────────────────────────────────────────────────

export async function seedServiceAttendance(
  requestId: string,
  scholarProfileId: string,
  overrides: Partial<NewServiceAttendance> = {},
): Promise<ServiceAttendance> {
  const [created] = await db
    .insert(serviceAttendance)
    .values({
      id: uuidv7(),
      requestId,
      scholarProfileId,
      acceptedAt: new Date(),
      startedAt: null,
      completedAt: null,
      durationSeconds: null,
      rating: null,
      ratingComment: null,
      ...overrides,
    })
    .returning();
  return created;
}

// ─── Notification ────────────────────────────────────────────────────────────

export async function seedNotification(
  userId: string,
  overrides: Partial<NewNotification> = {},
): Promise<Notification> {
  const [created] = await db
    .insert(notification)
    .values({
      id: uuidv7(),
      userId,
      type: "new_request_available",
      title: "Nova solicitação",
      body: "Uma nova solicitação foi criada",
      resourceId: null,
      readAt: null,
      ...overrides,
    })
    .returning();
  return created;
}

// ─── Student Disability ─────────────────────────────────────────────────────────

export async function seedStudentDisability(
  studentProfileId: string,
  overrides: Partial<NewStudentDisability> = {},
): Promise<StudentDisability> {
  const [created] = await db
    .insert(studentDisability)
    .values({
      id: uuidv7(),
      studentProfileId,
      disabilityType: "physical_disability",
      ...overrides,
    })
    .returning();
  return created;
}

// ─── Cleanup helper ────────────────────────────────────────────────────────────

export async function clearTable(tableName: string): Promise<void> {
  await db.execute(sql`DELETE FROM ${sql.identifier(tableName)}`);
}
