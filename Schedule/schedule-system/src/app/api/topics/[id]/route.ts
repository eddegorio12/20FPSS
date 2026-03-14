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
    const { name, parts } = await req.json();

    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }

    // Update topic name first
    const topic = await prisma.topic.update({
      where: { id },
      data: { name },
    });

    // Handle parts if provided (simplified merge logic for this implementation)
    // In a robust system, you'd match IDs to update existing parts, create new ones, and delete missing ones.
    // For simplicity, if parts are provided, we recreate them all.
    if (parts && Array.isArray(parts)) {
       // Delete existing parts
       await prisma.topicPart.deleteMany({
         where: { topicId: id }
       });
       
       // Re-create new parts
       if (parts.length > 0) {
         await prisma.topicPart.createMany({
           data: parts.map((partName: string) => ({
             name: partName,
             topicId: id,
           }))
         });
       }
    }

    const updatedTopic = await prisma.topic.findUnique({
      where: { id },
      include: { topicParts: true },
    });

    return NextResponse.json(updatedTopic);
  } catch (error: any) {
    console.error('[TOPIC_PUT]', error);
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

    // Check if topic is used in any schedules
    const schedulesCount = await prisma.schedule.count({
      where: { topicId: id },
    });

    if (schedulesCount > 0) {
      return new NextResponse(
        'Cannot delete topic because it is assigned to existing schedules.',
        { status: 400 }
      );
    }

    const topic = await prisma.topic.delete({
      where: { id },
    });

    return NextResponse.json(topic);
  } catch (error: any) {
    console.error('[TOPIC_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
