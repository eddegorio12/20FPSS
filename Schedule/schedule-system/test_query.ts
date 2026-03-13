import "dotenv/config";
import prisma from './src/lib/prisma';

async function main() {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        topic: true,
        topicPart: true,
        section: true,
        teacher: { include: { user: true } },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
    console.log("Success! Count:", schedules.length);
    console.log(JSON.stringify(schedules, null, 2));
  } catch (err) {
    console.error("Prisma error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
