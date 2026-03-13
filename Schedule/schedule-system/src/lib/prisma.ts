import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Persistent connection pool that survives Next.js hot reloads
const globalForPrisma = global as unknown as {
  pgPool: Pool | undefined
  prisma: PrismaClient | undefined
}

if (!globalForPrisma.pgPool) {
  globalForPrisma.pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    // Increase connection timeout to 60s because local Prisma dev proxy is slow on cold start
    connectionTimeoutMillis: 60000,
  })
}

const pool = globalForPrisma.pgPool

if (!globalForPrisma.prisma) {
  const adapter = new PrismaPg(pool)
  globalForPrisma.prisma = new PrismaClient({ adapter } as any)
}

const prisma = globalForPrisma.prisma!

export default prisma
