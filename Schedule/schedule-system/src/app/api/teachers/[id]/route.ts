import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { id } = await params;
    const { name, email } = await req.json();

    if (!name || !email) {
      return new NextResponse('Name and email are required', { status: 400 });
    }

    // Find the teacher profile to get userId
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { id },
    });

    if (!teacherProfile) {
       return new NextResponse('Teacher not found', { status: 404 });
    }

    // Check if email is taken by another user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== teacherProfile.userId) {
       return new NextResponse('Email is already in use', { status: 400 });
    }

    // Update User
    await prisma.user.update({
      where: { id: teacherProfile.userId },
      data: { name, email },
    });

    const updatedProfile = await prisma.teacherProfile.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, image: true } },
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error: any) {
    console.error('[TEACHER_PUT]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { id } = await params;

    // Check if teacher has schedules
    const schedulesCount = await prisma.schedule.count({
      where: { teacherId: id },
    });

    if (schedulesCount > 0) {
      return new NextResponse(
        'Cannot delete teacher because they are assigned to existing schedules.',
        { status: 400 }
      );
    }

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { id },
    });

    if (!teacherProfile) {
       return new NextResponse('Teacher not found', { status: 404 });
    }

    // Deleting the user will cascade delete the teacher profile
    await prisma.user.delete({
      where: { id: teacherProfile.userId },
    });

    return NextResponse.json(teacherProfile);
  } catch (error: any) {
    console.error('[TEACHER_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
