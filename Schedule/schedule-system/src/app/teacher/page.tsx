import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

export default async function TeacherDashboardPage() {
  const session = await auth();

  // @ts-ignore
  if (!session?.user) {
    redirect('/'); 
  }

  // @ts-ignore
  if (session.user.role === 'ADMIN') {
    redirect('/admin');
  }

  const teacherProfile = await prisma.teacherProfile.findUnique({
    // @ts-ignore
    where: { userId: session.user.id },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">My Schedules</h1>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700">{session.user.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
             <p className="text-gray-500">Teacher schedule list will render here using the /api/schedules filtering endpoint.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
