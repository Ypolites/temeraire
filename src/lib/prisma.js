/**
 * Prisma Client Singleton
 *
 * Centralizes PrismaClient instantiation and avoids multiple connections
 * in development (hot reload / nodemon).
 */

const { PrismaClient } = require("@prisma/client");

const globalForPrisma = globalThis;

// Prisma 6.x : client classique avec Rust engine
const prisma =
  globalForPrisma.__prismaClient || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prismaClient = prisma;
}

module.exports = prisma;
