import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

  const sections = await prisma.section.findMany({
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(sections);
}

export async function POST(req: Request) {
  const session = await auth();
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { name } = await req.json();
    if (!name) return new NextResponse('Name is required', { status: 400 });

    const section = await prisma.section.create({
      data: { name },
    });

    return NextResponse.json(section);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
