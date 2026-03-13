import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { CalendarSyncService } from '@/services/calendar-sync';
import { z } from 'zod';

const scheduleSchema = z.object({
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  roomNumber: z.string().optional(),
  notes: z.string().optional(),
  sectionId: z.string(),
  topicId: z.string(),
  topicPartId: z.string().optional(),
  teacherId: z.string(),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

  const { searchParams } = new URL(req.url);
  const sectionId = searchParams.get('sectionId');
  const topicId = searchParams.get('topicId');
  const dateStr = searchParams.get('date');
  const teacherId = searchParams.get('teacherId');

  const where: any = {};
  if (sectionId) where.sectionId = sectionId;
  if (topicId) where.topicId = topicId;
  if (dateStr) where.date = new Date(dateStr);
  
  // If user is a teacher, restrict view to their own schedules
  // @ts-ignore
  if (session.user.role === 'TEACHER') {
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!teacherProfile) {
      return NextResponse.json([]);
    }
    where.teacherId = teacherProfile.id;
  } else if (teacherId) {
    where.teacherId = teacherId;
  }

  const schedules = await prisma.schedule.findMany({
    where,
    include: {
      topic: true,
      topicPart: true,
      section: true,
      teacher: { include: { user: true } },
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });

  return NextResponse.json(schedules);
}

export async function POST(req: Request) {
  const session = await auth();
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();
    const data = scheduleSchema.parse(body);

    // Create schedule in DB
    const schedule = await prisma.schedule.create({
      data: {
        ...data,
        date: new Date(data.date),
        startTime: new Date(`${data.date}T${data.startTime}:00.000Z`), // Simplify for demo, handle TZ robustly in prod
        endTime: new Date(`${data.date}T${data.endTime}:00.000Z`),
      },
      include: {
        topic: true,
        topicPart: true,
        section: true,
        teacher: { include: { user: true } },
      },
    });

    // Trigger Google Calendar sync asynchronously
    // In a production serverless environment, you might use a Queue. Here we just await it to prevent cold-start death.
    await CalendarSyncService.syncCreate(schedule as any);

    return NextResponse.json(schedule);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }
    return new NextResponse(error.message, { status: 500 });
  }
}
