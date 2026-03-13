import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { CalendarSyncService } from '@/services/calendar-sync';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();
    
    // Explicitly format dates to valid Date objects based on incoming strings
    const updateData: any = { ...body };
    if (body.date) updateData.date = new Date(body.date);
    if (body.startTime && body.date) updateData.startTime = new Date(`${body.date}T${body.startTime}:00.000Z`);
    if (body.endTime && body.date) updateData.endTime = new Date(`${body.date}T${body.endTime}:00.000Z`);

    const updatedSchedule = await prisma.schedule.update({
      where: { id: params.id },
      data: updateData,
      include: {
        topic: true,
        topicPart: true,
        section: true,
        teacher: { include: { user: true } },
      },
    });

    await CalendarSyncService.syncUpdate(updatedSchedule as any);
    return NextResponse.json(updatedSchedule);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: params.id },
      include: {
        topic: true,
        topicPart: true,
        section: true,
        teacher: { include: { user: true } },
      },
    });

    if (!schedule) return new NextResponse('Not Found', { status: 404 });

    // Sync delete first
    await CalendarSyncService.syncDelete(schedule as any);

    // Delete from DB
    await prisma.schedule.delete({ where: { id: params.id } });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
