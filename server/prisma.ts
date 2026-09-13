import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const rawDatabaseUrl = process.env.DATABASE_URL ?? "";
const databaseUrl = rawDatabaseUrl
  ? `${rawDatabaseUrl}${rawDatabaseUrl.includes("?") ? "&" : "?"}sslaccept=strict`
  : rawDatabaseUrl;

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: { db: { url: databaseUrl } },
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
