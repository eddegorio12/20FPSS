import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const logs = await prisma.calendarSyncLog.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
      schedule: {
        select: { date: true, teacher: { select: { user: { select: { name: true } } } } },
      },
    },
  });

  return NextResponse.json(logs);
}
