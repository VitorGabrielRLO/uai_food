import { PrismaClient } from '@prisma/client';

// Esta é uma otimização para ambiente de desenvolvimento.
// Evita que o "hot reload" do Next.js crie múltiplas
// instâncias do PrismaClient.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // (Opcional) descomente para ver os logs das queries no console
    // log: ['query'], 
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}