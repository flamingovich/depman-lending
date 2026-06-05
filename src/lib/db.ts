import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

const PRISMA_CLIENT_KEY = "7.8.0-home-flags";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaKey?: string;
};

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  });
  return new PrismaClient({ adapter });
}

function getPrismaClient() {
  if (
    process.env.NODE_ENV !== "production" &&
    globalForPrisma.prisma &&
    globalForPrisma.prismaKey !== PRISMA_CLIENT_KEY
  ) {
    void globalForPrisma.prisma.$disconnect();
    globalForPrisma.prisma = undefined;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
    globalForPrisma.prismaKey = PRISMA_CLIENT_KEY;
  }

  return globalForPrisma.prisma;
}

export const prisma = getPrismaClient();
