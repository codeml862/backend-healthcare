// Server-side Prisma client bridge for Neon integrations
// Re-exports the singleton Prisma client used by the server
import prisma from '../prismaClient';

export { prisma };