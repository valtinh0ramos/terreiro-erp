import { PrismaClient } from "@prisma/client";

declare global {
  // Declaração global para evitar múltiplas instâncias em modo dev
  var prisma: PrismaClient | undefined;
}

// Cria apenas uma instância de PrismaClient
const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["error", "warn"], // opcional: você pode adicionar "query" para debug
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

// Exportações
export default prisma; // ✅ import prisma from "@/lib/prisma"
export { prisma };     // ✅ import { prisma } from "@/lib/prisma"

