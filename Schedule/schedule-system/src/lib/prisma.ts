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
    max: 5,                    // Must match connection_limit in DATABASE_URL
    idleTimeoutMillis: 10000,  // Release idle connections faster
    connectionTimeoutMillis: 60000, // 60s to handle slow cold starts
  })
}

const pool = globalForPrisma.pgPool

if (!globalForPrisma.prisma) {
  const adapter = new PrismaPg(pool)
  globalForPrisma.prisma = new PrismaClient({ adapter } as any)
}

const prisma = globalForPrisma.prisma!

export default prisma
