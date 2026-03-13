import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { CalendarSyncService } from '@/services/calendar-sync';
import { schedulePopulate } from '../route';
import { z } from 'zod';

const updateScheduleSchema = z.object({
  date: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  roomNumber: z.string().optional(),
  notes: z.string().optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();
    const data = updateScheduleSchema.parse(body);
    
    // Explicitly format dates to valid Date objects based on incoming strings
    const updateData: any = { ...data };
    if (data.date) updateData.date = new Date(data.date);
    if (data.startTime && data.date) updateData.startTime = new Date(`${data.date}T${data.startTime}:00.000Z`);
    if (data.endTime && data.date) updateData.endTime = new Date(`${data.date}T${data.endTime}:00.000Z`);

    const updatedSchedule = await prisma.schedule.update({
      where: { id },
      data: updateData,
      include: schedulePopulate,
    });

    await CalendarSyncService.syncUpdate(updatedSchedule as any);
    return NextResponse.json(updatedSchedule);
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }
    console.error("[PUT_SCHEDULE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: schedulePopulate,
    });

    if (!schedule) return new NextResponse('Not Found', { status: 404 });

    // Sync delete first
    await CalendarSyncService.syncDelete(schedule as any);

    await prisma.schedule.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("[DELETE_SCHEDULE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
