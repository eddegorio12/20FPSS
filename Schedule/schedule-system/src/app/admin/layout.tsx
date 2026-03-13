import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/'); // Redirect non-admins or unauthenticated
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white shadow-md border-r">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-blue-600">Admin Portal</h2>
        </div>
        <nav className="p-4 space-y-2">
          <Link href="/admin" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded">Dashboard</Link>
          <Link href="/admin/schedules" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded">Schedules</Link>
          <Link href="/admin/taxonomy" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded">Sections & Topics</Link>
          <Link href="/admin/teachers" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded">Teachers</Link>
          <Link href="/admin/logs" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded">Sync Logs</Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
