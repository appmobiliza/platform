export function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
        "Please provide a PostgreSQL connection string via DATABASE_URL. " +
        "For NeonDB, it should look like: postgresql://user:password@host.neon.tech/dbname",
    );
  }

  return databaseUrl;
}
