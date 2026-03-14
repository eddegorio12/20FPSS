import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

  const teachers = await prisma.teacherProfile.findMany({
    include: {
      user: {
        select: { name: true, email: true, image: true },
      },
      _count: {
        select: { schedules: true },
      },
    },
  });

  return NextResponse.json(teachers);
}

export async function POST(req: Request) {
  const session = await auth();
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { name, email } = await req.json();

    if (!name || !email) {
      return new NextResponse('Name and email are required', { status: 400 });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Create teacher profile if missing
      const existingProfile = await prisma.teacherProfile.findUnique({
        where: { userId: user.id },
      });
      if (existingProfile) {
        return new NextResponse('Teacher with this email already exists', { status: 400 });
      }
    } else {
      user = await prisma.user.create({
        data: {
          name,
          email,
          role: 'TEACHER', // Default role for standard accounts
        },
      });
    }

    const teacherProfile = await prisma.teacherProfile.create({
      data: {
        userId: user.id,
      },
      include: {
        user: {
          select: { name: true, email: true, image: true },
        },
      },
    });

    return NextResponse.json(teacherProfile);
  } catch (error: any) {
    console.error('[TEACHERS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
