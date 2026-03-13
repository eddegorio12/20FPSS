import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Calendar, Users, FolderTree, AlertCircle } from 'lucide-react';

export default async function AdminDashboardPage() {
  const scheduleCount = await prisma.schedule.count();
  const teacherCount = await prisma.teacherProfile.count();
  const sectionCount = await prisma.section.count();
  const recentErrors = await prisma.calendarSyncLog.count({
    where: { status: 'FAILED' },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Schedules</p>
            <p className="text-2xl font-bold text-gray-900">{scheduleCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Teachers</p>
            <p className="text-2xl font-bold text-gray-900">{teacherCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
            <FolderTree size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Sections</p>
            <p className="text-2xl font-bold text-gray-900">{sectionCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center space-x-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-full">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Failed Syncs</p>
            <p className="text-2xl font-bold text-red-600">{recentErrors}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Quick Actions</h2>
        <div className="flex space-x-4">
          <Link href="/admin/schedules" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition">
            Manage Schedules
          </Link>
          <Link href="/admin/logs" className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded shadow transition border">
            View Sync Logs
          </Link>
        </div>
      </div>
    </div>
  );
}
