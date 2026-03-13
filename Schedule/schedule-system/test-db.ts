import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

async function main() {
  const connectionString = 'postgresql://postgres:postgres@localhost:51214/postgres?sslmode=disable';
  const adapter = new PrismaPg({ connectionString });
  const client = new PrismaClient({ adapter } as any);

  try {
    const users = await client.user.findMany({ select: { id: true, email: true, name: true, role: true } });
    console.log('Users:', JSON.stringify(users, null, 2));

    // Promote the first user to ADMIN
    if (users.length > 0) {
      const updated = await client.user.update({
        where: { id: users[0].id },
        data: { role: 'ADMIN' },
      });
      console.log('✅ Promoted to ADMIN:', updated.email);
    }
  } catch (e: any) {
    console.error('❌ Error:', e.message);
  } finally {
    await client['$disconnect']();
  }
}

main();
