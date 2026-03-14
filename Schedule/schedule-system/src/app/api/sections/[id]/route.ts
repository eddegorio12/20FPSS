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
    const { name } = await req.json();

    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }

    const section = await prisma.section.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(section);
  } catch (error: any) {
    console.error('[SECTION_PUT]', error);
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

    // Check if section is used in any schedules
    const schedulesCount = await prisma.schedule.count({
      where: { sectionId: id },
    });

    if (schedulesCount > 0) {
      return new NextResponse(
        'Cannot delete section because it is assigned to existing schedules.',
        { status: 400 }
      );
    }

    const section = await prisma.section.delete({
      where: { id },
    });

    return NextResponse.json(section);
  } catch (error: any) {
    console.error('[SECTION_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
