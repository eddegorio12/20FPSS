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
    },
  });

  return NextResponse.json(teachers);
}
