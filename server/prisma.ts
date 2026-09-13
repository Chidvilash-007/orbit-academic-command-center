import prismaPackage from "@prisma/client";
import type { PrismaClient as PrismaClientType } from "@prisma/client";

const { PrismaClient } = prismaPackage;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientType };
const rawDatabaseUrl = process.env.DATABASE_URL ?? "";
const databaseUrl = rawDatabaseUrl
  ? `${rawDatabaseUrl}${rawDatabaseUrl.includes("?") ? "&" : "?"}sslaccept=strict`
  : rawDatabaseUrl;

export const prisma: PrismaClientType = globalForPrisma.prisma ?? new PrismaClient({
  datasources: { db: { url: databaseUrl } },
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
