import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

  const topics = await prisma.topic.findMany({
    include: { topicParts: true },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(topics);
}

export async function POST(req: Request) {
  const session = await auth();
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { name, parts } = await req.json();
    if (!name) return new NextResponse('Name is required', { status: 400 });

    const topic = await prisma.topic.create({
      data: {
        name,
        topicParts: {
          create: parts?.map((partName: string) => ({ name: partName })) || [],
        },
      },
      include: { topicParts: true },
    });

    return NextResponse.json(topic);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
