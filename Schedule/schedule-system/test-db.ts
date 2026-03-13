import "dotenv/config";
import { PrismaClient } from '@prisma/client'

async function main() {
  const client = new PrismaClient()

  try {
    const count = await client.user.count();
    console.log('✅ Connected! User count:', count);
  } catch (e: any) {
    console.error('❌ Connection failed:', e.name, e.message);
  } finally {
    await client.$disconnect();
  }
}

main();
