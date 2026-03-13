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
  sectionName: z.string().min(1, "Section Name is required"),
  topicName: z.string().min(1, "Topic Name is required"),
  topicPartName: z.string().optional(),
  teacherEmail: z.string().email("Valid Teacher Email is required"),
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

    const { sectionName, topicName, topicPartName, teacherEmail, ...rest } = data;

    // 1. Find or create Section
    let section = await prisma.section.findFirst({ where: { name: sectionName } });
    if (!section) {
      section = await prisma.section.create({ data: { name: sectionName } });
    }

    // 2. Find or create Topic
    let topic = await prisma.topic.findFirst({ where: { name: topicName } });
    if (!topic) {
      topic = await prisma.topic.create({ data: { name: topicName } });
    }

    // 3. Find or create TopicPart
    let topicPart = null;
    if (topicPartName && topicPartName.trim() !== '') {
      topicPart = await prisma.topicPart.findFirst({ where: { name: topicPartName, topicId: topic.id } });
      if (!topicPart) {
        topicPart = await prisma.topicPart.create({ data: { name: topicPartName, topicId: topic.id } });
      }
    }

    // 4. Find or create Teacher
    let user = await prisma.user.findUnique({ where: { email: teacherEmail } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: teacherEmail,
          name: teacherEmail.split('@')[0],
          role: 'TEACHER',
        }
      });
    }

    let teacher = await prisma.teacherProfile.findUnique({ where: { userId: user.id } });
    if (!teacher) {
      teacher = await prisma.teacherProfile.create({ data: { userId: user.id } });
    }

    // Create schedule in DB
    const schedule = await prisma.schedule.create({
      data: {
        ...rest,
        date: new Date(data.date),
        startTime: new Date(`${data.date}T${data.startTime}:00`),
        endTime: new Date(`${data.date}T${data.endTime}:00`),
        sectionId: section.id,
        topicId: topic.id,
        topicPartId: topicPart?.id,
        teacherId: teacher.id,
      },
      include: {
        topic: true,
        topicPart: true,
        section: true,
        teacher: { include: { user: true } },
      },
    });

    // Trigger Google Calendar sync asynchronously USING ADMIN TOKEN
    // @ts-ignore
    await CalendarSyncService.syncCreate(schedule as any, session.user.id);

    return NextResponse.json(schedule);
  } catch (error: any) {
    if (error && (error as any).name === 'ZodError') {
      return new NextResponse(JSON.stringify((error as any).errors), { status: 400 });
    }
    return new NextResponse((error as Error).message, { status: 500 });
  }
}
