// lib/prisma.ts
import { PrismaClient } from '../generated/prisma';
// Or, if you have a path alias like "@generated": ["./app/generated"] in tsconfig.json:
// import { PrismaClient } from '@/generated/prisma';

// Declare a global variable to store the PrismaClient instance.
// This is a common pattern in Next.js to prevent hot-reloading
// from creating new instances in development, which can lead to
// too many database connections.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

// In production, always create a new instance.
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, reuse the global instance if it already exists.
  // If it doesn't exist, create it and store it globally.
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;