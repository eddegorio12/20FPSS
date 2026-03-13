import "dotenv/config";
import { PrismaClient, Role } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Clear existing (optional)
  await prisma.schedule.deleteMany();
  await prisma.topicPart.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.section.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      role: Role.ADMIN,
    },
  });

  const teacher1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: Role.TEACHER,
      teacherProfile: {
        create: {},
      },
    },
    include: { teacherProfile: true },
  });

  const teacher2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: Role.TEACHER,
      teacherProfile: {
        create: {},
      },
    },
    include: { teacherProfile: true },
  });

  // Create Sections
  const section1 = await prisma.section.create({ data: { name: 'Grade 10-A' } });
  const section2 = await prisma.section.create({ data: { name: 'Grade 10-B' } });

  // Create Topics & Parts
  const mathTopic = await prisma.topic.create({
    data: {
      name: 'Mathematics',
      topicParts: {
        create: [{ name: 'Part 1 - Algebra' }, { name: 'Part 2 - Geometry' }],
      },
    },
    include: { topicParts: true },
  });

  const scienceTopic = await prisma.topic.create({
    data: {
      name: 'Science',
    },
  });

  console.log('Database seeded successfully!');
  console.log({ admin, teacher1, teacher2, section1, mathTopic });
}

main()
  .catch((e) => {
    console.error("SEED_ERROR:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
