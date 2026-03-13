import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { SignOutButton } from '@/components/SignOutButton';
import { format } from 'date-fns';

export default async function TeacherDashboardPage() {
  const session = await auth();

  // @ts-ignore
  if (!session?.user) redirect('/');
  // @ts-ignore
  if (session.user.role === 'ADMIN') redirect('/admin');

  const teacherProfile = await prisma.teacherProfile.findUnique({
    // @ts-ignore
    where: { userId: session.user.id },
    include: {
      schedules: {
        include: {
          section: true,
          topic: true,
          topicPart: true,
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      },
    },
  });

  const schedules = teacherProfile?.schedules ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <h1 className="text-xl font-bold text-blue-600">My Schedules</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 text-sm">{session?.user?.name}</span>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {schedules.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg font-medium">No schedules assigned yet.</p>
            <p className="text-sm mt-1">Contact your admin to get schedules assigned.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{format(new Date(s.date), 'MMM d, yyyy')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {format(new Date(s.startTime), 'h:mm a')} – {format(new Date(s.endTime), 'h:mm a')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{s.section.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {s.topic.name}{s.topicPart ? ` – ${s.topicPart.name}` : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{s.roomNumber ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
