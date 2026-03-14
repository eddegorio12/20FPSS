import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import TeacherDashboardClient from './TeacherDashboardClient';

export default async function TeacherDashboardPage() {
  const session = await auth();

  // @ts-ignore
  if (!session?.user) redirect('/');
  // @ts-ignore
  if (session.user.role === 'ADMIN') redirect('/admin');

  const teacherProfile = await prisma.teacherProfile.findUnique({
    // @ts-ignore
    where: { userId: session.user.id },
    include: {
      schedules: {
        include: {
          section: true,
          topic: true,
          topicPart: true,
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      },
    },
  });

  const schedules = teacherProfile?.schedules ?? [];

  return <TeacherDashboardClient userName={session?.user?.name ?? null} schedules={schedules} />;
}
